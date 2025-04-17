# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_04_15_212149) do
  create_table "categorias", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombreCategoria"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "detalle_ordenes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "orden_id", null: false
    t.bigint "producto_id", null: false
    t.bigint "tono_id"
    t.integer "cantidad"
    t.decimal "precioUnitario", precision: 10
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["orden_id"], name: "index_detalle_ordenes_on_orden_id"
    t.index ["producto_id"], name: "index_detalle_ordenes_on_producto_id"
    t.index ["tono_id"], name: "index_detalle_ordenes_on_tono_id"
  end

  create_table "envios", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "orden_id", null: false
    t.string "direccion_envio"
    t.string "estado_envio"
    t.datetime "fecha_envio"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["orden_id"], name: "index_envios_on_orden_id"
  end

  create_table "metodo_de_pagos", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombreMetodo"
    t.boolean "estado", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "ordenes", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.date "fechaOrden"
    t.decimal "total", precision: 10, scale: 2
    t.bigint "usuario_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["usuario_id"], name: "index_ordenes_on_usuario_id"
  end

  create_table "pagos", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "orden_id", null: false
    t.bigint "metodo_de_pago_id", null: false
    t.datetime "fecha_pago"
    t.decimal "pago_total", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["metodo_de_pago_id"], name: "index_pagos_on_metodo_de_pago_id"
    t.index ["orden_id"], name: "index_pagos_on_orden_id"
  end

  create_table "productos", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombreProducto"
    t.decimal "precioProducto", precision: 10, scale: 2
    t.text "descripcionProducto"
    t.integer "stock"
    t.bigint "categoria_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["categoria_id"], name: "index_productos_on_categoria_id"
  end

  create_table "roles", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombreRol"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tonos", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombreTono"
    t.bigint "producto_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["producto_id"], name: "index_tonos_on_producto_id"
  end

  create_table "usuarios", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nombre"
    t.string "apellido"
    t.string "email"
    t.string "password"
    t.string "telefono", limit: 10
    t.string "direccion"
    t.bigint "rol_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["rol_id"], name: "index_usuarios_on_rol_id"
  end

  add_foreign_key "detalle_ordenes", "ordenes"
  add_foreign_key "detalle_ordenes", "productos"
  add_foreign_key "detalle_ordenes", "tonos"
  add_foreign_key "envios", "ordenes"
  add_foreign_key "ordenes", "usuarios"
  add_foreign_key "pagos", "metodo_de_pagos"
  add_foreign_key "pagos", "ordenes"
  add_foreign_key "productos", "categorias"
  add_foreign_key "tonos", "productos"
  add_foreign_key "usuarios", "roles"
end
