Defining Catalogs
Catalogs are defined in the pnpm-workspace.yaml file. There are two ways to define catalogs.

Using the (singular) catalog field to create a catalog named default.
Using the (plural) catalogs field to create arbitrarily named catalogs.
tip
If you have an existing workspace that you want to migrate to using catalogs, you can use the following codemod:

pnpx codemod pnpm/catalog
