# Frontend - Inventario WMS

Aplicación Angular mínima para consumir la API creada en `C:\prb\webapi`. Tiene login, JWT y CRUD de productos con lotes/proveedores.

## Antes de iniciar

1. En la API ejecuta `C:\prb\webapi\database\WMSResMondelez_Inventory.sql` y `C:\prb\webapi\database\WMSResMondelez_Inventory_StoredProcedures.sql` en la base `WMSResMondelez`.
2. Inicia la API desde `C:\prb\webapi`:

```powershell
dotnet run --project webapi/webapi.csproj
```

La API queda en `http://localhost:5189` y el frontend ya usa esa URL en `src/app/services/api.service.ts`.

3. En esta carpeta ejecuta:

```powershell
npm start
```

4. Abre `http://localhost:4200`.

El usuario inicial es `admin` y la contraseña `Admin123*`; es solo para desarrollo.

## Cómo funciona

- `app.ts`: controla formularios, acciones y el token guardado en `localStorage`.
- `api.service.ts`: concentra las llamadas HTTP y agrega `Authorization: Bearer {token}` para productos.
- `models/product.ts`: define el producto y sus lotes.
- `app.html`: contiene login, formulario de producto y tabla de consulta.

## Flujo

1. Login: API devuelve JWT.
2. Angular lo guarda y llama `GET /api/Products`.
3. Guardar: usa `POST /api/Products` al crear o `PUT /api/Products/{id}` al editar.
4. Eliminar: usa `DELETE /api/Products/{id}`.

Cada lote requiere número, proveedor, precio y stock. El backend recibe todos los lotes junto al producto.

## Si cambia la URL de API

Edita esta línea de `src/app/services/api.service.ts`:

```ts
private readonly baseUrl = 'http://localhost:5189/api';
```

El backend permite CORS desde `http://localhost:4200`. Si Angular usa otro puerto, agrégalo en `AllowedOrigins` de `C:\prb\webapi\webapi\appsettings.json`.
