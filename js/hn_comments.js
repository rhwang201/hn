var COMMAND_KEYS              = [91, 93]; // left and right command keys
var SHIFT_KEY                 = 16;

var DOWN_KEY                  = 74;  // j
var UP_KEY                    = 75;  // k

var DOWN_SIBLING_KEY          = -1;   // <shift-j>
var UP_SIBLING_KEY            = -2;   // <shift-k>

var PARENT_KEY                = 80;  // p
var TOP_KEY                   = 84;  // t

var COMMAND                   = "command";
var SHIFT                     = "shift";

var OPEN_LINK_KEY             = 13; // enter

var HELP_KEY_NO_SHIFT         = 191;  // ?
var HELP_KEYCODE              = -3;

var HIGHLIGHTED_BACKGROUND_COLOR  = "white";
var DEFAULT_BACKGROUND_COLOR      = "#F6F6EF";

var comment_tree = $(".comment-tree");

function tree(value, children) {
  return {
    value: value,
    children: children || [],
    parent: null
  };
}

/**
 * Given an array of node depths, reconstruct the tree.
 */
function constructTree(rows) {
  // Make inaccessible root
  var root = makeRoot();
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var depth = getDepth(row);
    var value = row;
    // Get the right-most node at depth-1
    var parentNode = findRightMostNode(root, depth - 1);
    parentNode.children.push(tree(value));
  }

  return root;
}

function makeRoot() {
  var main = $("#hnmain");
  var title = main.find("table")[1];
  return tree(title);
}

function getDepth(tr) {
  var ind = $(tr).find(".ind")[0];
  return ind.firstChild.width / 40;
}

function findRightMostNode(root, depth) {
  var queue = [root];
  while (depth !== -1) {
    var children = _.map(queue, function(node) {
      return node ? node.children : [];
    });

    queue = _.reduce(children, function(a, b) {
      return a.concat(b);
    });
    depth = depth - 1;
  }

  return queue.length > 0 ? queue[queue.length - 1] : null;
}

function linkParents(root) {
  var queue = [root];
  while (queue.length !== 0) {
    _.each(queue, function(node) {
      _.each(node.children, function(child) {
        child.parent = node;
      });
    });


    var children = _.map(queue, function(node) {
      return node ? node.children : [];
    });
    queue = _.reduce(children, function(a, b) {
      return a.concat(b);
    });
  }
}

function highlightComment(row, color) {
  var borderStyle;
  if (row.nodeName === "TABLE") {
    $(row).css("background-color", color);

    borderStyle = color === HIGHLIGHTED_BACKGROUND_COLOR ? "dotted" : "none";
    $(row).css("border-style", borderStyle);
    $(row).css("border-width", "thin");
  } else {
    var votelinks = $(row).find(".votelinks")[0];
    var dflt = $(row).find(".default")[0];

    $(votelinks).css("background-color", color);
    $(dflt).css("background-color", color);

    borderStyle = color === HIGHLIGHTED_BACKGROUND_COLOR ? "dotted" : "none";
    $(votelinks).css("border-style", borderStyle);
    $(dflt).css("border-style", borderStyle);
    $(votelinks).css("border-width", "thin");
    $(dflt).css("border-width", "thin");
  }
}

/**
 * leftmost child, else next sibling, else ancestor next sibling
 */
function moveDown(node) {
  if (node.children.length > 0) {
    return node.children[0];
  } else {
      var i = node.parent.children.indexOf(node) + 1;
      if (i < node.parent.children.length) {
        return node.parent.children[i];
      } else {
        do {
          i = node.parent.children.indexOf(node) + 1;
          node = node.parent;
        } while (i >= node.children.length);

        return node.children[i];
      }
  }
}

/**
 * Move up: previous sibling rightmost, else parent
 */
function moveUp(node) {
  if (!node.parent || !node.parent.children) {
    return node;
  }

  var i = node.parent.children.indexOf(node) - 1;
  if (i > -1) {
    node = node.parent.children[i];
    while (node.children.length > 0) {
      node = node.children[node.children.length - 1];
    }

    return node;
  } else {
    return node.parent ? node.parent : node;
  }
}

function scrollIfNecessary(el) {
  var top = $(el).offset().top - (window.innerHeight / 2);
  $('html, body').animate({ scrollTop: top }, 1);
}

function openLink(node, isCommandPressed) {
  if (node.parent) {
    return;
  }
  var athing = $(node.value).find(".athing");
  var link = $(athing).find("td")[2];
  var url = $(link).find("a")[0].href;

  var window_name = isCommandPressed ? "_blank" : "_self";

  window.open(url, window_name);
}

function insertHelpModal() {
  $(document.body).append([
    '<div id="help" class="modal fade" tabindex="-1" role="dialog" style="display: none;">',
      '<div class="modal-dialog">',
        '<div class="modal-content">',
          '<div class="modal-header">',
            '<h2 class="modal-title">Help</h2>',
            '<hr>',
          '</div>',
          '<div class="modal-body">',
            '<table class="table">',
              '<tr>',
                '<td><kbd class="shortcut-key">?</kbd></td>',
                '<td>Show Help</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">j</kbd></td>',
                '<td>Move down one comment</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">k</kbd></td>',
                '<td>Move up one comment</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">Shift + j</kbd></td>',
                '<td>Move down one sibling comment</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">Shift + k</kbd></td>',
                '<td>Move up one sibling comment</td>',
              '</tr>',
                '<td><kbd class="shortcut-key">p</kbd></td>',
                '<td>Move to parent comment</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">t</kbd></td>',
                '<td>Move to top comment</td>',
              '</tr>',
              '<tr>',
                '<td><kbd class="shortcut-key">Enter</kbd></td>',
                '<td>Follow submission link</td>',
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
  var rows = $(".comment-tree").find(".athing");
  var tree = constructTree(rows);
  linkParents(tree);

  insertHelpModal();

  var current_node = tree;
  highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);

  var pressedKeys = [];
  $(document.body).on('keydown', function(e) {
    var keyCode = e.keyCode;
    if (COMMAND_KEYS.indexOf(keyCode) > -1) {
      pressedKeys.push(COMMAND);
    }
    if (keyCode === SHIFT_KEY) {
      pressedKeys.push(SHIFT);
    }

    var isCommandPressed = pressedKeys.indexOf(COMMAND) > -1;
    var isShiftPressed = pressedKeys.indexOf(SHIFT) > -1;
    var prevNode = current_node;
    var i;

    if (keyCode === DOWN_KEY && isShiftPressed) {
      keyCode = DOWN_SIBLING_KEY;
    } else if (keyCode === UP_KEY && isShiftPressed) {
      keyCode = UP_SIBLING_KEY;
    } else if (keyCode === HELP_KEY_NO_SHIFT && isShiftPressed) {
      keyCode = HELP_KEYCODE;
    }

    switch (keyCode) {
      case DOWN_KEY:
        current_node = moveDown(prevNode);
        if (current_node != prevNode) {
          highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
          highlightComment(prevNode.value, DEFAULT_BACKGROUND_COLOR);
        }
        scrollIfNecessary(current_node.value);
        break;
      case UP_KEY:
        current_node = moveUp(prevNode);
        if (current_node != prevNode) {
          highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
          highlightComment(prevNode.value, DEFAULT_BACKGROUND_COLOR);
        }
        scrollIfNecessary(current_node.value);
        break;
      case DOWN_SIBLING_KEY:
        i = current_node.parent.children.indexOf(current_node) + 1;
        if (i < current_node.parent.children.length) {
          current_node = current_node.parent.children[i];
          highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
          highlightComment(prevNode.value, DEFAULT_BACKGROUND_COLOR);
        }
        scrollIfNecessary(current_node.value);
        break;
      case UP_SIBLING_KEY:
        i = current_node.parent.children.indexOf(current_node) - 1;
        if (i > -1) {
          current_node = current_node.parent.children[i];
          highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
          highlightComment(prevNode.value, DEFAULT_BACKGROUND_COLOR);
        }
        scrollIfNecessary(current_node.value);
        break;
      case PARENT_KEY:
        if (current_node.parent) {
          current_node = current_node.parent;
          highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
          highlightComment(prevNode.value, DEFAULT_BACKGROUND_COLOR);
        }
        scrollIfNecessary(current_node.value);
        break;
      case TOP_KEY:
        while (current_node.parent && current_node.parent.parent) {
          highlightComment(current_node.value, DEFAULT_BACKGROUND_COLOR);
          current_node = current_node.parent;
        }
        highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);
        scrollIfNecessary(current_node.value);
        break;
      case OPEN_LINK_KEY:
        openLink(current_node, isCommandPressed);
        break;
      case HELP_KEYCODE:
        toggleHelp();
        break;
    }
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
