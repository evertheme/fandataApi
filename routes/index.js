var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:bCr3at1v32@localhost:5432/nfldb';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// http://localhost:3210/api/v1/schedule/1448328306578/1448933106578
router.get('/api/v1/schedule/', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results = [];
    /*
    var t = new Date().getDate() + (2 - new Date().getDay() - 1);
    var s = new Date();
    var e = new Date();
    s.setDate(t);
    console.log(s.getDay());
    e.setDate(s.getDate()+7);
    s.setHours(s.getHours() - 6);
    e.setHours(e.getHours() - 6);
    console.log(s);
    console.log(e);
    var qry = [
        "SELECT",
        "  gsis_id,",
        "  away_team,",
        "  home_team,",
        "  start_time ",
        "FROM",
        "  game ",
        "WHERE",
        "  start_time > timestamp '" + s.toUTCString() + "' AND ",
        "  start_time < timestamp '" + e.toUTCString() + "' ",
        "ORDER BY",
        "  start_time ASC;"
    ].join("");
    */
    var qry = [
        "SELECT ",
        "  gsis_id, ",
        "  away_team, ",
        "  home_team, ",
        "  start_time ",
        "FROM ",
        "  game ",
        "WHERE ",
        "  start_time > current_date - cast(extract(dow from current_date) as int) + 2 AND ",
        "  start_time < current_date - cast(extract(dow from current_date) as int) + 9 ",
        "ORDER BY ",
        "  start_time ASC; "
    ].join("");
    //console.log(qry);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query(qry);
        // Stream results back one row at a time
        query.on('row', function(row) {
            //console.log(row);
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

// http://localhost:3210/api/v1/schedule/1448328306578/1448933106578
router.get('/api/v1/schedule/:startDate/:endDate', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log(req.params.startDate);
    var results = [];
    var startDate = Number(req.params.startDate);
    var endDate = Number(req.params.endDate);
    var dt_1 = new Date(startDate);
    var dt_2 = new Date(endDate);
    var qry = [
        "SELECT",
        "  gsis_id,",
        "  away_team,",
        "  home_team,",
        "  start_time ",
        "FROM",
        "  game ",
        "WHERE",
        "  start_time > timestamp '" + dt_1.toUTCString() + "' AND ",
        "  start_time < timestamp '" + dt_2.toUTCString() + "' ",
        "ORDER BY",
        "  start_time ASC;"
    ].join("");
    console.log(qry);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query(qry);
        // Stream results back one row at a time
        query.on('row', function(row) {
            console.log(row);
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

// $ curl -X GET localhost:3210/api/v1/player/00-0019596
router.get('/api/v1/player/:playerId', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results = [];
    var playerId = req.params.playerId;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query("SELECT * FROM player WHERE player_id='" + playerId + "';");
        // Stream results back one row at a time
        query.on('row', function(row) {
            console.log(row);
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

// $ curl -X GET localhost:3210/api/v1/player/games/00-0019596
router.get('/api/v1/player/:playerId/games/', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results = [];
    var playerId = req.params.playerId;
    var qry = [
        "SELECT",
        "  player.player_id,",
        "  game.gsis_id,",
        "  game.away_team,",
        "  game.home_team,",
        "  game.season_year,",
        "  game.week,",
        "  sum(play_player.passing_att) as pass_att,",
        "  sum(play_player.receiving_tar) as rece_tar,",
        "  sum(play_player.rushing_att) as rush_att ",
        "FROM",
        "  game,",
        "  player,",
        "  play_player ",
        "WHERE",
        "  player.player_id = play_player.player_id AND ",
        "  player.player_id = '" + playerId + "' AND",
        "  play_player.gsis_id = game.gsis_id AND",
        "  game.season_type = 'Regular' ",
        "GROUP BY",
        "  player.player_id,",
        "  game.gsis_id ",
        "ORDER BY",
        "  game.gsis_id DESC;"
    ].join("");
    console.log(qry);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Select Data
        var query = client.query(qry);
        // Stream results back one row at a time
        query.on('row', function(row) {
            console.log(row);
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.get('/api/v1/player/:playerId/matchup/:gameId/:fromId', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results  = [];
    var playerId = req.params.playerId;
    var gameId   = req.params.gameId;
    var fromId   = req.params.fromId;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        var rowjson = {};
        var rowkeys = ['vs','game','year','dkopt','fdopt','dkdpt','fddpt','paatt','pacmp','payds','patds','paint','retar','rerec','reyds','retds','ruatt','ruyds','rutds','fumbs','kptds'];
        // SQL Query > Select Data
        var query = client.query("SELECT fn_get_all_history_offense('"+playerId+"','"+gameId+"','"+fromId+"');");

        // Stream results back one row at a time
        query.on('row', function(row) {
            var rowvals = row.fn_get_all_history_offense.replace('(', '').replace(')', '').split(',');
            var nodekey = rowvals[0].split('-')[0];
            var nodeval = rowvals[0].split('-')[1];
            rowjson[nodekey] = {};
            for (var i=0; i<rowvals.length; i++) {
              if (i==0) {
                rowjson[nodekey]['vs'] = nodeval;
              } else {
                rowjson[nodekey][rowkeys[i]] = rowvals[i];
              }
              //rowjson[rowkeys[i]] = rowvals[i];
            }
            //console.log(rowjson);
            results.push(rowjson[nodekey]);
            //results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
            //return res.json(rowjson);
        });

    });

});

router.get('/api/v1/stats/:year/:week', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results  = [];
    var _year = req.params.year;
    var _week = req.params.week;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        var rowkeys = ['gsis_id','player_id','salary_dk','salary_fd','games','pts_dk_last_1','pts_dk_last_3','pts_dk_last_5','pts_dk_avg','value_dk','pts_fd_last_1','pts_fd_last_3','pts_fd_last_5','pts_fd_avg','value_fd'];
        // SQL Query > Select Data
        var query = client.query("SELECT fn_player_agg_stats_points_salary('"+_year+"','"+_week+"');");
        // Stream results back one row at a time
        query.on('row', function(row) {
            var rowvals = row.fn_player_agg_stats_points_salary.replace('(', '').replace(')', '').split(',');
            var rowjson = {};
            for (var i=0; i<rowvals.length; i++) {
              rowjson[rowkeys[i]] = rowvals[i];
            }
            //console.log(rowjson);
            results.push(rowjson);
            //results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
            //return res.json(rowjson);
        });

    });

});

router.get('/api/v1/json/stats/:year/:week', function(req, res) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var results  = [];
    var _year = req.params.year;
    var _week = req.params.week;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
         // SQL Query > Select Data
        var query = client.query("SELECT doc from jsonb_player_stats_weekly where doc_id = '"+_year+"-"+_week+"';");
        // Stream results back one row at a time
        query.on('row', function(row) {
            console.log(row);
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results[0]['doc']);
        });
    });

});


module.exports = router;
