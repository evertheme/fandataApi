exports.getGamesCurrentWeek = function() {
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
  return qry;
};

exports.getGamesBetweenDates = function(dt1, dt2) {
  var qry = [
    "SELECT",
    "  gsis_id,",
    "  away_team,",
    "  home_team,",
    "  start_time ",
    "FROM",
    "  game ",
    "WHERE",
    "  start_time > timestamp '" + dt1.toUTCString() + "' AND ",
    "  start_time < timestamp '" + dt2.toUTCString() + "' ",
    "ORDER BY",
    "  start_time ASC;"
  ].join("");
  return qry;
};

exports.getGamesByPlayerId = function(playerId) {
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
  return qry;
};