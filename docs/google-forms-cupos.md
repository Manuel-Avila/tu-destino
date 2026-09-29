# Conectar el Google Form con la convocatoria (cupos)

Cada evento tiene su propio Google Form (columna `eventos.forms_url`). Cuando alguien envía el
formulario, un pequeño script de Google (Apps Script) avisa al backend y este suma **1** a
`eventos.cupos_ocupados`. La página del evento consulta ese número cada 30 s, así que la barra
"35 de 50 lugares ocupados" y el aviso "¡Últimos N espacios!" se actualizan solos.

## 1. Secreto compartido

En `backend/.env` (y en el entorno de despliegue) define un valor largo y aleatorio:

```
FORMS_WEBHOOK_SECRET=pon_aqui_un_valor_largo_y_aleatorio
```

Sin esta variable el webhook responde `503` y no cuenta nada.

## 2. Script en cada Google Form

1. Abre el formulario → menú ⋮ → **Editor de secuencias de comandos**.
2. Pega este código y cambia las 3 constantes:

```javascript
const API_URL = 'https://TU-DOMINIO-DEL-BACKEND';          // sin "/" al final
const SLUG    = 'limpieza-microplasticos-balandra';        // eventos.slug de ESTE evento
const SECRET  = 'el mismo valor de FORMS_WEBHOOK_SECRET';

function onFormSubmit(e) {
  const respuesta = e.response;
  // Si tu formulario recopila correo (Configuración → Recopilar correos), viene aquí:
  const correo = respuesta.getRespondentEmail() || '';

  UrlFetchApp.fetch(`${API_URL}/api/eventos/${SLUG}/asistencia`, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-forms-secret': SECRET },
    payload: JSON.stringify({
      respuestaId: respuesta.getId(),   // evita contar dos veces la misma respuesta
      correo: correo,
    }),
    muteHttpExceptions: true,
  });
}
```

3. Icono del reloj (**Activadores**) → **Añadir activador**:
   - Función: `onFormSubmit`
   - Origen del evento: **Del formulario**
   - Tipo de evento: **Al enviar el formulario**
4. Acepta los permisos que pide Google.

> El backend debe ser accesible desde internet (Apps Script no puede llamar a `localhost`).
> Para probar en local puedes usar un túnel (ngrok, cloudflared, etc.).

## 3. Poner la liga del formulario en la BD

```sql
UPDATE eventos
SET forms_url = 'https://docs.google.com/forms/d/e/XXXXXXXX/viewform'
WHERE slug = 'limpieza-microplasticos-balandra';
```

## Cómo se comporta

- Cada respuesta nueva suma 1 cupo. Si Google reenvía la misma respuesta, no se duplica.
- Al llegar a `cupo_total` el botón de la página cambia a **"Cupo lleno"** y ya no abre el formulario.
  Google Forms no se cierra solo: para que además deje de aceptar respuestas, desactiva
  "Aceptar respuestas" en el formulario (o agrega en el script `FormApp.getActiveForm().setAcceptingResponses(false)`
  cuando la respuesta del backend traiga `convocatoria.lleno === true`).
- Probar el webhook a mano:

```bash
curl -X POST http://localhost:3000/api/eventos/limpieza-microplasticos-balandra/asistencia \
  -H "Content-Type: application/json" \
  -H "x-forms-secret: TU_SECRETO" \
  -d '{"respuestaId":"prueba-1","correo":"alguien@correo.com"}'
```
