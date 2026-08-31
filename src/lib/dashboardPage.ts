export const dashboard = {
  hero: {
    title: "Hola, ",
    subtitle: "¿Qué te gustaría hacer hoy?",
  },
  section: "Módulos de trabajo",
  cards: [
    {
      icon: "/icons/Resumen.svg",
      title: "Ver resumen",
      desc: "Obtén un resumen de tu actividad reciente.",
      url: "/dashboard/resumen",
      permission: "resumen",
      color: "#D02727",
    },
    {
      icon: "/icons/Reportes.svg",
      title: "Gestionar reportes",
      desc: "Crea y gestiona los reportes.",
      url: "/dashboard/reportes",
      permission: "reportes",
      color: "#1D8425",
    },
    {
      icon: "/icons/Usuarios.svg",
      title: "Editar usuarios",
      desc: "Gestiona los usuarios de la aplicación.",
      url: "/dashboard/usuarios",
      permission: "usuarios",
      color: "#271E90",
    },
    {
      icon: "/icons/Ciudadano.svg",
      title: "Gestionar ciudadanos",
      desc: "Administra la información de los ciudadanos.",
      url: "/dashboard/ciudadanos",
      permission: "ciudadanos",
      color: "#C60081",
    },
  ],
};
