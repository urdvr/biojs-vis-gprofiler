yourDiv.innerHTML = "";

var gprofiler = require("biojs-vis-gprofiler");

gp = new gprofiler({
  container : "#" + yourDiv.id,
  width     : 600,
  height    : 600
});

gp.on("onrender", function() {
  if (console && typeof(console) === "object")
    console.log("caught render event");
});

gp.render({
  query     : ["swi4", "swi6", "mbp1", "mcm1", "fkh1", "fkh2"],
  organism  : "scerevisiae"
});
