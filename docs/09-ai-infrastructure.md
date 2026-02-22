# 09 - AI Infrastructure & Rulesync

Para garantizar una colaboración fluida entre el desarrollador y los agentes de IA, el proyecto utiliza un sistema de reglas unificadas y herramientas de asistencia avanzada.

## 1. Rulesync (Gestión de Reglas Unificadas)
Utilizamos [Rulesync](https://github.com/dyoshikawa/rulesync) para gestionar las configuraciones de múltiples herramientas de IA (actualmente **Google Antigravity** y **Gemini CLI**) desde una única fuente de verdad en `.rulesync/`.

### 1.1 Estructura de Reglas
- `.rulesync/rules/`: Reglas generales de comportamiento y estándares de código.
- `.rulesync/skills/`: Habilidades declarativas que los agentes pueden aprender.
- `.rulesync/mcp.json`: Configuración de servidores MCP (Model Context Protocol).

### 1.2 Generación de Configuraciones
Para sincronizar las reglas con las herramientas específicas, se utiliza:
```bash
npx rulesync generate
```
Esto genera archivos como `.geminiignore`, `GEMINI.md`, y configuraciones en `.gemini/`.

## 2. Serena (Coding Agent Toolkit)
[Serena](https://oraios.github.io/serena/) está integrada como un servidor MCP para proporcionar capacidades de análisis semántico avanzado.

### 2.1 Capacidades de Serena
- **Semantic Retrieval**: Búsqueda de código basada en símbolos y estructuras relacionales.
- **Context Awareness**: Mejora la eficiencia de tokens al proporcionar solo el contexto relevante.
- **Tooling**: Proporciona herramientas adicionales al agente para interactuar con el codebase de forma más inteligente.

### 2.2 Configuración MCP
Serena se configura automáticamente a través de Rulesync en los archivos de configuración de cada agente (ej: `.gemini/settings.json`).

```json
{
  "mcpServers": {
    "serena": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--enable-web-dashboard",
        "false",
        "--project",
        "."
      ]
    }
  }
}
```

## 3. Beneficios
- **Consistencia**: Todos los agentes siguen las mismas reglas de Clean Architecture y estándares de Jorge Casar Persona.
- **Eficiencia**: Reducción del uso de tokens gracias al análisis semántico de Serena.
- **Mantenibilidad**: Las reglas se actualizan en un solo lugar y se propagan a todas las herramientas.
