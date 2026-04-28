```
prisma migrate diff \
    --from-url "$DIRECT_URL" \
    --to-url "postgresql://login:password@localhost:5432/db" \
    --script

```

```
npx prisma migrate diff \
  --from-schema=prisma/schema.prisma \
  --to-config-datasource \
  --script
```

```
npx prisma migrate diff \
  --from-config-datasource \
  --to-schema=prisma/schema.prisma \
  --script
```
