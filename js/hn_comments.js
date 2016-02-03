// TODO click through root node

var DOWN_KEY                  = 106;  // j
var UP_KEY                    = 107;  // k

var DOWN_SIBLING_KEY          = 74;   // <shift-j>
var UP_SIBLING_KEY            = 75;   // <shift-k>

var PARENT_KEY                = 112;  // p
var TOP_KEY                   = 116;  // t

var OPEN_LINK_KEY             = 13; // enter

var HIGHLIGHTED_BACKGROUND_COLOR = "white";
var DEFAULT_BACKGROUND_COLOR = "#F6F6EF";

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
      return a.concat(b)
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
      return a.concat(b)
    });
  }
}

function highlightComment(row, color) {
  if (row.nodeName === "TABLE") {
    $(row).css("background-color", color);

    var borderStyle = color === HIGHLIGHTED_BACKGROUND_COLOR ? "dotted" : "none";
    $(row).css("border-style", borderStyle);
    $(row).css("border-width", "thin");
  } else {
    var votelinks = $(row).find(".votelinks")[0];
    var dflt = $(row).find(".default")[0];

    $(votelinks).css("background-color", color);
    $(dflt).css("background-color", color);

    var borderStyle = color === HIGHLIGHTED_BACKGROUND_COLOR ? "dotted" : "none";
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
          var i = node.parent.children.indexOf(node) + 1;
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



// Begin main.
$(document).ready(function() {
  var rows = $(".comment-tree").find(".athing");
  var tree = constructTree(rows);
  linkParents(tree);

  var current_node = tree;
  highlightComment(current_node.value, HIGHLIGHTED_BACKGROUND_COLOR);

  $(document.body).on('keypress', function(e) {
    var keyCode = e.keyCode;
    var prevNode = current_node;
    var i;

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
        // TODO
        break;
      case OPEN_LINK_KEY:
        // TODO
        break;
    }
  });
});
