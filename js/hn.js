// TODO help
// TODO ugh adding bootstrap fucks everything up

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

var TOP_KEY                   = 71; // g
var BOTTOM_KEY_NO_SHIFT       = 71; // G
var BOTTOM_KEYCODE            = -2;

var COMMAND_KEYS              = [91, 93]; // left and right command keys
var SHIFT_KEY                 = 16;

var OPEN_LINK_KEY             = 13; // enter
var OPEN_COMMENTS_KEY         = 67; // c

var HELP_KEY_NO_SHIFT         = 191;  // ?
var HELP_KEYCODE              = -1;

var COMMAND = "command";
var SHIFT = "shift";

var HIGHLIGHTED_BACKGROUND_COLOR  = "white";
var DEFAULT_BACKGROUND_COLOR      = "#F6F6EF";

/**
 * Highlight the three tr's for element index in table.
 */
function highlightTableRows(table, index) {
  var rows = table.find("tr");
  var row_index = index * 3;

  var more = rows[index * 3 + 1];
  var moreSelected = index === NUMBER_ROWS_PER_PAGE;
  var background_color = moreSelected ? HIGHLIGHTED_BACKGROUND_COLOR : DEFAULT_BACKGROUND_COLOR;
  $(more).css("background-color", background_color);

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
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
  var rows = table.find("tr");
  var row_index = index * 3;
  var row = rows[row_index];

  var top = $(row).offset().top - (window.innerHeight / 2);
  $('html, body').animate({ scrollTop: top }, 1);
}

/**
 * Opens url at index of table in current window.
 */
function openLink(table, index, isCommandPressed) {
  var rows = table.find("tr");
  var row_index = index * 3;

  var url;
  if (index === NUMBER_ROWS_PER_PAGE) {
    var more = rows[index * 3 + 1];
    url = $(more).find("a")[0].href;
  } else {
    var row = $(rows[row_index]);
    var title = $(row.find("td:nth-of-type(3)"));
    var link = title.children("a");
    url = link[0].href;
  }

  var window_name = isCommandPressed ? "_blank" : "_self";

  window.open(url, window_name);
}

/**
 * Opens comments at index of table in current window.
 */
function openComments(table, index, isCommandPressed) {
  var rows = table.find("tr");
  var row_index = index * 3 + 1;

  if (index === NUMBER_ROWS_PER_PAGE) {
    return;
  }

  var row = $(rows[row_index]);
  var subtext = $(row.find("td.subtext"));
  var link = subtext.find("a:nth-of-type(2)");
  var url = link[0].href;
  var window_name = isCommandPressed ? "_blank" : "_self";

  window.open(url, window_name);
}

function insertHelpModal() {
  $(document.body).append([
    '<div id="help" class="modal fade" tabindex="-1" role="dialog">',
      '<div class="modal-dialog">',
        '<div class="modal-content">',
          '<div class="modal-header">',
            '<h2 class="modal-title">Help</h2>',
          '</div>',
          '<div class="modal-body">',
            '<table class="table">',
              '<tr>',
                '<td>?</td>',
                '<td>Show Help</td>',
              '</tr>',
              '<tr>',
                '<td>j</td>',
                '<td>Move down</td>',
              '</tr>',
              '<tr>',
                '<td>k</td>',
                '<td>Move up</td>',
              '</tr>',
              '<tr>',
                '<td>\< Enter \></td>',
                '<td>Open link in current tab</td>',
              '</tr>',
              '<tr>',
                '<td>\< Command-Enter \></td>',
                '<td>Open link in new tab</td>',
              '</tr>',
                '<td>c</td>',
                '<td>Open comments in current tab</td>',
              '</tr>',
              '<tr>',
                '<td>\< Command-c \></td>',
                '<td>Open comments in new tab</td>',
              '</tr>',
            '</table>',
          '</div>',
        '</div>',
      '</div>',
    '</div>'
  ].join(''));
}

/**
 * Toggles Help Modal.
 */
function toggleHelp() {
  if ($.modal.isActive()) {
    $.modal.close();
  } else {
    $("#help").modal();
  }
}


// Begin main.
$(document).ready(function() {
  var table = $(".itemlist");

  var element_index = 0;

  highlightTableRows(table, element_index);

  insertHelpModal();

  var pressedKeys = [];
  $(document.body).on('keydown', function(e) {
    var keyCode = e.keyCode;
    if (COMMAND_KEYS.indexOf(keyCode) > -1) {
      pressedKeys.push(COMMAND);
    }
    if (keyCode === SHIFT_KEY) {
      pressedKeys.push(SHIFT);
    }

    var isShiftPressed = pressedKeys.indexOf(SHIFT) > -1;
    var isCommandPressed = pressedKeys.indexOf(COMMAND) > -1;

    if (keyCode === HELP_KEY_NO_SHIFT && isShiftPressed) {
      keyCode = HELP_KEYCODE;
    }
    if (keyCode === BOTTOM_KEY_NO_SHIFT && isShiftPressed) {
      keyCode = BOTTOM_KEYCODE;
    }

    switch (keyCode) {
      case DOWN_KEY:
        element_index = Math.min(element_index + 1, NUMBER_ROWS_PER_PAGE);
        highlightTableRows(table, element_index);
        scrollIfNecessary(table, element_index);
        break;
      case UP_KEY:
        element_index = Math.max(element_index - 1, 0);
        highlightTableRows(table, element_index);
        scrollIfNecessary(table, element_index);
        break;
      case TOP_KEY:
        element_index = 0;
        highlightTableRows(table, element_index);
        scrollIfNecessary(table, element_index);
        break;
      case BOTTOM_KEYCODE:
        element_index = NUMBER_ROWS_PER_PAGE;
        highlightTableRows(table, element_index);
        scrollIfNecessary(table, element_index);
        break;
      case OPEN_LINK_KEY:
        openLink(table, element_index, isCommandPressed);
        break;
      case OPEN_COMMENTS_KEY:
        openComments(table, element_index, isCommandPressed);
        break;
      case HELP_KEYCODE:
        toggleHelp();
        break;
    }

    log('At element i=' + element_index);
  });
  $(document.body).on('keyup', function(e) {
    var i;
    if (COMMAND_KEYS.indexOf(e.keyCode) > -1) {
      i = pressedKeys.indexOf(COMMAND);
      if (i > -1) {
        pressedKeys.splice(i, 1);
      }
    }

    if (e.keyCode === SHIFT_KEY) {
      i = pressedKeys.indexOf(SHIFT);
      if (i > -1) {
        pressedKeys.splice(i, 1);
      }
    }
  });
});
