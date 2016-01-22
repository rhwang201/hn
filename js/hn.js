// TODO es6
// TODO figure out command modifier-key
// TODO open link in new tab
var DEBUG = false;
function log(msg) {
  if (DEBUG) {
    console.log(msg);
  }
}

log("Hello, Hacker News!");

var NUMBER_ROWS_PER_PAGE = 30;

var DOWN_KEY                  = 106; // j
var UP_KEY                    = 107; // k
var OPEN_LINK_KEY             = 13; // enter
var OPEN_LINK_NEW_TAB_KEY     = ''; // command enter
var OPEN_COMMENTS_KEY         = 99; // c
var OPEN_COMMENTS_NEW_TAB_KEY = ''; // command c

var HIGHLIGHTED_BACKGROUND_COLOR = "white";
var DEFAULT_BACKGROUND_COLOR = "#F6F6EF";

/**
 * Highlight the three tr's for element index in table.
 */
function highlightTableRows(table, index) {
  var rows = table.find("tr");
  var row_index = index * 3;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var background_color;
    if (row_index <= i && i < row_index + 3) {
      background_color = HIGHLIGHTED_BACKGROUND_COLOR;
    } else {
      background_color = DEFAULT_BACKGROUND_COLOR;
    }
    $(row).css("background-color", background_color);
  }
}

/**
 * Opens url at index of table in current window.
 */
function openLink(table, index) {
  var rows = table.find("tr");
  var row_index = index * 3;

  var row = $(rows[row_index]);
  var title = $(row.find("td:nth-of-type(2)"));
  var link = title.children("a");
  var url = link[0].href;

  window.open(url, "_self");
}

/**
 * Opens comments at index of table in current window.
 */
function openComments(table, index) {
  var rows = table.find("tr");
  var row_index = index * 3 + 1;

  var row = $(rows[row_index]);
  var subtext = $(row.find("td.subtext"));
  var link = subtext.find("a:nth-of-type(2)");
  var url = link[0].href;

  window.open(url, "_self");
}


// Begin main.
var table = $(".itemlist");

var element_index = 0;

highlightTableRows(table, element_index);

$("body").keypress(function(e) {
  var keyCode = e.keyCode;
  switch (keyCode) {
    case DOWN_KEY:
      element_index = Math.min(element_index + 1, NUMBER_ROWS_PER_PAGE - 1);
      highlightTableRows(table, element_index);
      break;
    case UP_KEY:
      element_index = Math.max(element_index - 1, 0);
      highlightTableRows(table, element_index);
      break;
    case OPEN_LINK_KEY:
      openLink(table, element_index);
      break;
    case OPEN_COMMENTS_KEY:
      openComments(table, element_index);
      break;
  }

  log('At element i=' + element_index);
});
