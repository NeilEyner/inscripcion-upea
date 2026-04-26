// ==========================================
// ENUMS
// ==========================================

export type CategoriaPrograma =
  | "DIPLOMADO"
  | "ESPECIALIDAD"
  | "MAESTRIA"
  | "DOCTORADO";

export type EstadoInscripcion =
  | "preinscrito"
  | "confirmado"
  | "transferido"
  | "cancelado";

export type EstadoDocumento =
  | "pendiente"
  | "entregado"
  | "observado"
  | "exento";

export type TipoPago =
  | "MATRICULA"
  | "CUOTA_INICIAL"
  | "CUOTA_MENSUAL"
  | "COLEGIATURA_TOTAL"
  | "CERTIFICADO";

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "DEPOSITO_BANCO";

// ==========================================
// ENTIDADES BASE (reflejan tablas 1:1)
// ==========================================

export interface SesionPrograma {
  id: string;
  categoria: CategoriaPrograma;
  nombre: string;
  version: string;
  gestion: number;
  sede: string;
  modalidad: string;
  cupoMinimo: number;
  cupoMaximo: number;
  responsableRegistro: string;
  passwordHash: string;
  activo: boolean;
  creadoEn: Date;
}

export interface Participante {
  id: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo?: string;
  celular?: string;
  creadoEn: Date;
}

export interface Inscripcion {
  id: string;
  participanteId: string;
  sesionId: string;
  fechaInscripcion: Date;
  estadoInscripcion: EstadoInscripcion;
  tipoDescuento?: string;
  descuentoPorcentaje: number;
  esTransferencia: boolean;
  sesionOrigenId?: string;
  motivoTransferencia?: string;
  observacionesGenerales?: string;
}

export interface PlantillaRequisito {
  id: number;
  categoria: CategoriaPrograma;
  nombreDocumento: string;
  descripcionDetalle?: string;
}

export interface ControlDocumento {
  id: number;
  inscripcionId: string;
  plantillaId: number;
  estado: EstadoDocumento;
  fechaEntrega?: Date;
  archivoUrl?: string;
  observaciones?: string;
}

export interface Pago {
  id: string;
  inscripcionId: string;
  nroBoleta?: string;
  monto: number;
  tipo: TipoPago;
  metodo: MetodoPago;
  fechaPago: Date;
  observaciones?: string;
}

// ==========================================
// VISTAS Y TIPOS COMPUESTOS (para la UI)
// ==========================================

/** Refleja vista_sesion_stats */
export interface SesionStats {
  id: string;
  nombre: string;
  categoria: CategoriaPrograma;
  version: string;
  gestion: number;
  sede: string;
  modalidad: string;
  cupoMinimo: number;
  cupoMaximo: number;
  activo: boolean;
  totalInscritos: number;
  totalConfirmados: number;
  totalPreinscritos: number;
  totalCancelados: number;
  totalRecaudado:  string;
}

/** Refleja vista_inscripcion_detalle */
export interface InscripcionDetalle {
  id:                      string
  sesionId:                string
  estadoInscripcion:       EstadoInscripcion
  fechaInscripcion:        Date
  tipoDescuento:           string | null
  descuentoPorcentaje:     number
  esTransferencia:         boolean
  observacionesGenerales:  string | null
  participanteId:          string
  ci:                      string
  nombres:                 string
  apellidoPaterno:         string
  apellidoMaterno:         string | null
  correo:                  string | null
  celular:                 string | null
  nombreCompleto:          string
  totalDocs:               number
  docsEntregados:          number
  docsPendientes:          number
  docsObservados:          number
  totalPagado:             string  // NUMERIC → string
}

/** Documento con metadata de plantilla (para la tabla visual) */
export interface DocumentoConPlantilla extends ControlDocumento {
  nombreDocumento: string;
  descripcionDetalle?: string;
}

/** Fila completa de la tabla de participantes en el dashboard */
export interface FilaTabla {
  inscripcion: InscripcionDetalle;
  documentos: DocumentoConPlantilla[];
}

// ==========================================
// TIPOS PARA SERVER ACTIONS (inputs)
// ==========================================

export interface CrearSesionInput {
  categoria: CategoriaPrograma;
  nombre: string;
  version?: string;
  gestion?: number;
  sede?: string;
  modalidad?: string;
  cupoMinimo?: number;
  cupoMaximo?: number;
  responsableRegistro: string;
  password: string; // texto plano, se hashea en el action
}

export interface CrearInscripcionInput {
  sesionId: string;
  // Datos del participante
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo?: string;
  celular?: string;
  // Datos de inscripción
  tipoDescuento?: string;
  descuentoPorcentaje?: number;
  observacionesGenerales?: string;
}

export interface ActualizarDocumentoInput {
  inscripcionId: string
  plantillaId:   number
  estado:        EstadoDocumento
  observaciones?: string
}

export interface RegistrarPagoInput {
  inscripcionId: string;
  nroBoleta?: string;
  monto: number;
  tipo: TipoPago;
  metodo: MetodoPago;
  observaciones?: string;
}

// ==========================================
// TIPOS DE RESPUESTA ESTÁNDAR PARA ACTIONS
// ==========================================

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ==========================================
// CONSTANTES DE UTILIDAD
// ==========================================

export const CATEGORIAS: CategoriaPrograma[] = [
  "DIPLOMADO",
  "ESPECIALIDAD",
  "MAESTRIA",
  "DOCTORADO",
];

export const LABEL_CATEGORIA: Record<CategoriaPrograma, string> = {
  DIPLOMADO: "Diplomado",
  ESPECIALIDAD: "Especialidad",
  MAESTRIA: "Maestría",
  DOCTORADO: "Doctorado",
};

export const LABEL_ESTADO_INSCRIPCION: Record<EstadoInscripcion, string> = {
  preinscrito: "Preinscrito",
  confirmado: "Confirmado",
  transferido: "Transferido",
  cancelado: "Cancelado",
};

export const LABEL_ESTADO_DOCUMENTO: Record<EstadoDocumento, string> = {
  pendiente: "Pendiente",
  entregado: "Entregado",
  observado: "Observado",
  exento: "Exento",
};

export const LABEL_TIPO_PAGO: Record<TipoPago, string> = {
  MATRICULA: "Matrícula",
  CUOTA_INICIAL: "Cuota Inicial",
  CUOTA_MENSUAL: "Cuota Mensual",
  COLEGIATURA_TOTAL: "Colegiatura Total",
  CERTIFICADO: "Certificado",
};

export const LABEL_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DEPOSITO_BANCO: "Depósito Banco",
};

/** Color de badge por estado de documento */
export const COLOR_ESTADO_DOCUMENTO: Record<
  EstadoDocumento,
  { bg: string; text: string; border: string }
> = {
  entregado: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  pendiente: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  observado: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  exento: {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

/** Color de badge por estado de inscripción */
export const COLOR_ESTADO_INSCRIPCION: Record<
  EstadoInscripcion,
  { bg: string; text: string; border: string }
> = {
  confirmado: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  preinscrito: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  transferido: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  cancelado: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

/** Color de badge por categoría de programa */
export const COLOR_CATEGORIA: Record<
  CategoriaPrograma,
  { bg: string; text: string; border: string; accent: string }
> = {
  DIPLOMADO: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    accent: "bg-blue-500",
  },
  ESPECIALIDAD: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    accent: "bg-violet-500",
  },
  MAESTRIA: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
  DOCTORADO: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    accent: "bg-amber-500",
  },
};

// ── Entidad: control_documento ────────────────────────────────────────────────

export interface DocumentoControl {
  id:            number
  inscripcionId: string
  plantillaId:   number
  estado:        EstadoDocumento
  fechaEntrega:  Date | null
  archivoUrl:    string | null
  observaciones: string | null
}

// ── Entidad: plantilla_requisito ──────────────────────────────────────────────


// ── Constantes de UI ──────────────────────────────────────────────────────────


// ── Tipos de input para Server Actions ────────────────────────────────────────

export interface ActualizarDocumentoInput {
  inscripcionId: string
  plantillaId:   number
  estado:        EstadoDocumento
  observaciones?: string
}

