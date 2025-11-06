# Code Citations

## License: MIT
https://github.com/mabotech/mabozen/tree/531b138fea1212e959ecfb9370b622b0c9f519a5/mabozen/pg/pg_schema.py

```
.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN
```

