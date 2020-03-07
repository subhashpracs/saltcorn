const Router = require("express-promise-router");

const db = require("../db");
const { mkTable, h, link, post_btn } = require("./markup.js");
const Table = require("../db/table");
const { loggedIn } = require("./utils");
const router = new Router();

// export our router to be mounted by the parent application
module.exports = router;

router.get("/:tname", loggedIn, async (req, res) => {
  const { tname } = req.params;
  const table = await Table.find({ name: tname });

  const fields = await table.getFields();
  var tfields = fields.map(f => ({ label: f.label, key: f.name }));
  tfields.push({
    label: "Edit",
    key: r => link(`/edit/${table.name}/${r.id}`, "Edit")
  });
  tfields.push({
    label: "Delete",
    key: r => post_btn(`/delete/${table.name}/${r.id}`, "Delete")
  });
  const rows = await table.getJoinedRows();
  res.sendWrap(
    `${table.name} data table`,
    h(1, table.name),
    mkTable(tfields, rows),
    link(`/edit/${table.name}`, "Add row")
  );
});
