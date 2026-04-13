# 🎓 Quizs - Plataforma de Aprendizaje Primaria

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![Stack](https://img.shields.io/badge/Stack-JS%20|%20HTML%20|%20CSS-green)
![Educational](https://img.shields.io/badge/Target-Primaria-orange)

**Quizs** es una aplicación web interactiva diseñada para que estudiantes de primaria refuercen sus conocimientos en asignaturas clave como Lengua, Ciencias Naturales y Ciencias Sociales. La plataforma utiliza un motor de cuestionarios dinámico basado en archivos JSON, priorizando la ligereza y el feedback pedagógico inmediato.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Arquitectura de Datos:** Almacenamiento desacoplado en archivos **JSON**.
- **Estilos:** Sistema de diseño personalizado con animaciones interactivas (`style.css`).
- **Automatización:** Script `ctx.sh` para la gestión de contexto y documentación técnica.

---

## 📁 Estructura del Proyecto

```text
.
├── cuestionarios/          # Banco de preguntas por asignatura y tema
│   ├── ian-5-lengua-t*.json  # Unidades de Lengua
│   ├── ian-5-natu-t*.json    # Unidades de Ciencias Naturales
│   └── ian-5-soci-t*.json    # Unidades de Ciencias Sociales
├── index.html              # Aplicación principal (Interfaz del Alumno)
├── editor.html             # Herramienta de visualización de cuestionarios
├── index.json              # Manifiesto central de contenidos disponibles
├── script.js               # Motor lógico (Carga, validación y feedback)
├── style.css               # Definiciones visuales y UI adaptativa
└── ctx.sh                  # Herramienta de mantenimiento del proyecto
```

## ⚙️ Instalación y Ejecución
Al ser una aplicación estática (SPA), no requiere de un proceso de compilación complejo.

 1. Clonar el repositorio:

```Bash
git clone [https://github.com/tu-usuario/quizs.git](https://github.com/tu-usuario/quizs.git)
cd quizs
```
 2. Ejecutar en local:
Debido a las políticas de seguridad del navegador (CORS) al realizar peticiones fetch a archivos JSON locales, se recomienda utilizar un servidor local:

 - VS Code: Instala la extensión Live Server y haz clic en "Go Live".

 - Python: Ejecuta `python -m http.server 8000` en la raíz del proyecto.

## 📊 Formato de los Cuestionarios
El motor de la aplicación está diseñado para interpretar una estructura JSON específica que incluye retroalimentación didáctica:

``` JSON
{
  "titulo": "Nombre del Tema",
  "preguntas": [
    {
      "id": 1,
      "pregunta": "¿Ejemplo de pregunta?",
      "opciones": ["Opción 0", "Opción 1", "Opción 2", "Opción 3"],
      "respuestaCorrecta": 0,
      "explicacion": "Información adicional para reforzar el aprendizaje tras responder."
    }
  ]
}
```

## 🚀 Funcionalidades Críticas
 - Motor de Ingesta: Carga asíncrona de temas mediante la lectura del manifiesto index.json.
 - Feedback en Tiempo Real: Validación de respuestas con despliegue automático de la .explicacion-box.
 - Interfaz Adaptativa: Diseño optimizado para dispositivos utilizados en entornos escolares.


# ✒️ Autor
Sherlockes - Proyecto Quizs - 2026. Herramienta de apoyo escolar.
