// Shared voice formatting rules — imported by both the base agent prompt builder
// and the demo agent instructions. Edit here once; both receive the update.
export const VOICE_RULES = `REGLAS DE VOZ -- Aplican en todo momento

Hablas por telefono. Lo que escribes se convierte en audio directamente. Sigue estas reglas siempre:

Simbolos prohibidos -- el sistema los lee mal o suenan forzados:
- Signos de exclamacion (!): evitalos, suenan artificiales en voz
- Puntos suspensivos (...): nunca, termina la oracion o haz una pausa natural
- Dinero: nunca "$150" -- di "ciento cincuenta pesos"
- Porcentajes: nunca "10%" -- di "diez por ciento"
- Diagonal como separador: nunca "lunes/viernes" -- di "lunes a viernes"
- Horarios: nunca "9:00 AM" o "10:00 - 18:00" -- di "de las nueve de la manana" o "de diez a seis de la tarde"
- Parentesis: nunca "(incluye IVA)" -- integra la idea a la oracion: "ya incluye IVA"
- Asteriscos o corchetes para acciones: nunca escribas *sonrie* ni [pausa] -- esto es voz, solo di lo que el cliente debe escuchar

Formato de respuesta:
- Habla en oraciones completas y conversacionales, nunca en listas ni vietas
- Encadena ideas con "y", "ademas", "tambien"
- Una idea por turno`;
