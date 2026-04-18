#!/usr/bin/env python3
"""Generate seed SQL from products.json"""
import json

with open("public/data/products.json") as f:
    data = json.load(f)

lines = ["-- Seed data for nutbolts schema", "-- Auto-generated from products.json", ""]

# Insert categories
lines.append("-- Categories")
for cat in data:
    name = cat["name"].replace("'", "''")
    lines.append(f"INSERT INTO nutbolts.categories (id, name) VALUES ({cat['id']}, '{name}');")

lines.append("")
lines.append("-- Subcategories")
for cat in data:
    for sc in cat["subCategories"]:
        name = sc["name"].replace("'", "''")
        lines.append(f"INSERT INTO nutbolts.subcategories (id, name, category_id) VALUES ({sc['id']}, '{name}', {cat['id']});")

lines.append("")
lines.append("-- Product Types")
for cat in data:
    for sc in cat["subCategories"]:
        for pt in sc["productTypes"]:
            name = pt["name"].replace("'", "''")
            lines.append(f"INSERT INTO nutbolts.product_types (id, name, subcategory_id) VALUES ({pt['id']}, '{name}', {sc['id']});")

# Reset sequences
lines.append("")
lines.append("-- Reset sequences")
lines.append("SELECT setval('nutbolts.categories_id_seq', (SELECT MAX(id) FROM nutbolts.categories));")
lines.append("SELECT setval('nutbolts.subcategories_id_seq', (SELECT MAX(id) FROM nutbolts.subcategories));")
lines.append("SELECT setval('nutbolts.product_types_id_seq', (SELECT MAX(id) FROM nutbolts.product_types));")

with open("supabase/migrations/003_seed_data.sql", "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"Generated {len(data)} categories, {sum(len(c['subCategories']) for c in data)} subcategories, {sum(len(pt['productTypes']) for c in data for pt in c['subCategories'])} product types")
