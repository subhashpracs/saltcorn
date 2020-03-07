const types = require("../types");
const { sqlsanitize, fkeyPrefix } = require("../db/internal.js");

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash("danger", "Must be logged in first");
    res.redirect("/auth/login");
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role_id === 1) {
    next();
  } else {
    req.flash("danger", "Must be admin");
    res.redirect(req.user ? "/" : "/auth/login");
  }
}
const calc_sql_type = ftype => {
  if (ftype.startsWith(fkeyPrefix)) {
    return `int references ${sqlsanitize(ftype.replace(fkeyPrefix, ""))} (id)`;
  } else {
    return types.as_dict[ftype].sql_name;
  }
};

const attributesToFormFields = type => {
  const a2ff = attr => ({
    label: attr.name,
    name: attr.name,
    input_type: "fromtype",
    type: types.as_dict[attr.type]
  });
  return type.attributes ? type.attributes.map(a2ff) : [];
};

module.exports = {
  sqlsanitize,
  fkeyPrefix,
  calc_sql_type,
  attributesToFormFields,
  loggedIn,
  isAdmin
};
