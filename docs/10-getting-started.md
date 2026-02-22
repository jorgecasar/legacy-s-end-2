# 10 - Getting Started & Setup

Este documento detalla los pasos iniciales tomados para configurar el entorno de desarrollo de **Legacy's End**.

## 1. Inicialización del Proyecto
- Se inicializó npm y se configuró como un proyecto ESM nativo.
- Se definieron los scripts base de gestión.

```bash
npm init -y
```

## 2. Dependencias de Infraestructura de IA
Se instalaron únicamente las herramientas de gestión de IA para asegurar la calidad y consistencia desde el inicio:
- **IA**: `rulesync` (Gestión de reglas unificadas).
- **Análisis Semántico**: `serena` (vía servidor MCP).

## 3. Configuración de Agentes (Rulesync & Serena)
Se configuró Rulesync para orquestar las reglas de los agentes autorizados (**Google Antigravity** y **Gemini CLI**).

1.  **Inicialización**: `npx rulesync init`.
2.  **Configuración de Objetivos**: Configurado `rulesync.jsonc` con los targets `antigravity` y `geminicli`.
3.  **Habilidades Oficiales**: Se incorporaron las habilidades de Rulesync:
    ```bash
    npx rulesync fetch dyoshikawa/rulesync --features skills
    ```
4.  **Integración de Serena**: Configurado el servidor MCP de Serena en `.rulesync/mcp.json` para proporcionar análisis semántico profundo a los agentes.
5.  **Habilidades Externas (Antigravity Awesome Skills)**:
    Se configuró la descarga de más de 70 habilidades especializadas desde el repositorio oficial de Antigravity. Debido al volumen, se requiere un token de acceso de GitHub:
    ```bash
    export $(cat .env | xargs) && npx rulesync install
    ```
6.  **Generación y Git**:
    ```bash
    npx rulesync generate
    npx rulesync gitignore
    ```

## 5. Estándares de IA y Código
Se han sincronizado las reglas de Rulesync con los estándares definidos en la documentación técnica (`docs/05-architecture-and-standards.md`):
- Clean Architecture (4 capas).
- TC39 Decorators con `accessor`.
- Result Pattern para lógica de negocio.
- Enfoque estricto en TDD/BDD.
