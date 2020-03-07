const types = require("../types");
const db = require(".");
const { sqlsanitize, fkeyPrefix } = require("./internal.js");
const { calc_sql_type } = require("../routes/utils.js");

class Field {
  constructor(o) {
    this.label = o.flabel || o.label;
    this.name = o.fname || o.name;
    this.id = o.id;
    this.ftype = o.ftype;
    this.options = o.options;
    this.input_type = o.input_type;
    this.is_fkey = o.ftype && o.ftype.startsWith(fkeyPrefix);

    if (!this.is_fkey) this.type = types.as_dict[o.ftype];
    else this.reftable = sqlsanitize(o.ftype.replace(fkeyPrefix, ""));
    this.attributes = o.attributes;
    if (o.table_id) this.table_id = o.table_id;

    if (o.table) {
      this.table = o.table;
      if (o.table.id && !o.table_id) this.table_id = o.table.id;
    }
  }

  async fill_fkey_options() {
    if (this.is_fkey) {
      const table = await db.get_table_by_name(this.reftable);
      //const fields = await Field.get_by_table_id(table.id);
      const rows = await db.select(this.reftable);
      const summary_field = table.summary_field || "id";
      this.options = [
        ...new Set(rows.map(r => ({ label: r[summary_field], value: r.id })))
      ];
    }
  }

  get to_formfield() {
    return this.is_fkey
      ? {
          label: this.label,
          name: this.name,
          input_type: "select",
          options: this.options
        }
      : this.input_type
      ? {
          name: this.name,
          input_type: this.input_type,
          label: this.label
        }
      : {
          label: this.label,
          name: this.name,
          type: this.type,
          input_type: "fromtype"
        };
  }

  get sql_type() {
    if (this.is_fkey) {
      return `int references ${this.reftable} (id)`;
    } else {
      return this.type.sql_name;
    }
  }

  validate(whole_rec) {
    const type = this.is_fkey ? types.as_dict.Integer : this.type;
    const readval = type.readFromFormRecord
      ? type.readFromFormRecord(whole_rec, this.name)
      : type.read(whole_rec[this.name]);
    if (typeof readval === "undefined")
      return { error: "Unable to read " + type.name };
    const valres = type.validate(this.attributes || {})(readval);
    if (valres.error) return valres;
    else return { success: readval };
  }

  static async get_by_table_id(tid) {
    const db_flds = await db.select("fields", { table_id: tid });
    return db_flds.map(dbf => new Field(dbf));
  }

  static async create(fld) {
    const f = new Field(fld);

    await db.query(
      `alter table ${sqlsanitize(f.table.name)} add column ${sqlsanitize(
        f.name
      )} ${calc_sql_type(f.ftype)}`
    );
    await db.insert("fields", {
      table_id: f.table_id,
      fname: f.name,
      flabel: f.label,
      ftype: f.ftype,
      attributes: f.attributes
    });
    return f;
  }
}
module.exports = Field;
