// TODO es6
// TODO scroll if at bottom?
// TODO Remember position

// TODO Navigate comments

var DEBUG = false;
function log(msg) {
  if (DEBUG) {
    console.log(msg);
  }
}

log("Hello, Hacker News!");

var NUMBER_ROWS_PER_PAGE = 30;

var DOWN_KEY                  = 74; // j
var UP_KEY                    = 75; // k
var COMMAND_KEYS               = [91, 93]; // left and right command keys
var OPEN_LINK_KEY             = 13; // enter
var OPEN_COMMENTS_KEY         = 67; // c

var SCROLLOFF = 3;
var UP = "up";
var DOWN = "down";
var COMMAND = "command";

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
 * Auto-scrolls the page.
 */
function scrollIfNecessary(table, index, direction) {
  return;

  var rows = table.find("tr");
  var row_index = index * 3 + 3 * (direction === DOWN ? 1 : -1) * SCROLLOFF;
  var row = rows[row_index];

  if (!isScrolledIntoView(row)) {
    $('html, body').animate({
      scrollTop: $(row).offset().top
    }, 100);
  }
}

function isScrolledIntoView(elem) {
    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return elemTop > docViewBottom;
    //return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

/**
 * Opens url at index of table in current window.
 */
function openLink(table, index, isCommandPressed) {
  var rows = table.find("tr");
  var row_index = index * 3;

  var row = $(rows[row_index]);
  var title = $(row.find("td:nth-of-type(3)"));
  var link = title.children("a");
  var url = link[0].href;
  var window_name = isCommandPressed ? "_blank" : "_self";

  window.open(url, window_name);
}

/**
 * Opens comments at index of table in current window.
 */
function openComments(table, index, isCommandPressed) {
  var rows = table.find("tr");
  var row_index = index * 3 + 1;

  var row = $(rows[row_index]);
  var subtext = $(row.find("td.subtext"));
  var link = subtext.find("a:nth-of-type(2)");
  var url = link[0].href;
  var window_name = isCommandPressed ? "_blank" : "_self";

  window.open(url, window_name);
  window.focus();
}


// Begin main.
var table = $(".itemlist");

var element_index = 0;

highlightTableRows(table, element_index);

var pressedKeys = [];
$(document.body).on('keydown', function(e) {
  var keyCode = e.keyCode;
  if (COMMAND_KEYS.indexOf(keyCode) > -1) {
    pressedKeys.push(COMMAND);
  }

  var isCommandPressed = pressedKeys.indexOf(COMMAND) > -1;
  switch (keyCode) {
    case DOWN_KEY:
      element_index = Math.min(element_index + 1, NUMBER_ROWS_PER_PAGE - 1);
      highlightTableRows(table, element_index);
      scrollIfNecessary(table, element_index, DOWN);
      break;
    case UP_KEY:
      element_index = Math.max(element_index - 1, 0);
      highlightTableRows(table, element_index);
      scrollIfNecessary(table, element_index, UP);
      break;
    case OPEN_LINK_KEY:
      openLink(table, element_index, isCommandPressed);
      break;
    case OPEN_COMMENTS_KEY:
      openComments(table, element_index, isCommandPressed);
      break;
  }

  log('At element i=' + element_index);
});
$(document.body).on('keyup', function(e) {
  if (COMMAND_KEYS.indexOf(e.keyCode) > -1) {
    var i = pressedKeys.indexOf(COMMAND);
    if (i > -1) {
      pressedKeys.splice(i, 1);
    }
  }
});
