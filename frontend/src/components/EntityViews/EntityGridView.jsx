import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import InquilinoDetail from '../propiedades/inquilinos/InquilinoDetail';
import { getInquilinosByPropiedad, getInquilinosByContrato } from '../propiedades/inquilinos';
import ContratoDetail from '../propiedades/contratos/ContratoDetail';
import {
  LocationOnOutlined as AddressIcon,
  LocationCityOutlined as CityIcon,
  SquareFootOutlined as AreaIcon,
  MonetizationOnOutlined as MoneyIcon,
  AccountBalanceWalletOutlined as DepositIcon,
  AccountBalance as BankIcon,
  AttachMoney as CurrencyIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  HomeOutlined,
  Apartment as ApartmentIcon,
  Description as ContractIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  StoreOutlined,
  Bed as BedIcon,
  Inventory as InventoryIcon,
  Visibility as ViewIcon,
  InfoOutlined as InfoIcon,
  Description as DescriptionIcon,
  DriveFolderUpload as DriveIcon,
  // Íconos para habitaciones
  BathtubOutlined as BathtubIcon,
  KingBed,
  SingleBed,
  ChairOutlined,
  KitchenOutlined,
  LocalLaundryServiceOutlined
} from '@mui/icons-material';
import { getEstadoContrato, calcularDuracionTotal, getApellidoInquilinoContrato, calcularRangoMesesContrato } from '../propiedades/contratos/contratoUtils';
import { contarItemsPorHabitacion } from '../propiedades/propiedadUtils';
import { icons } from '../../navigation/menuIcons';
import { getStatusIconComponent, getEstadoColor, getEstadoText } from '../common/StatusSystem';

// Constantes de estilo jerárquicas para alineación y separadores
const SECTION_PADDING_X = 1;
const SECTION_PADDING_Y = 0.5;
const SECTION_GAP = 0.5;
const SECTION_MIN_HEIGHT = '40px';
const ROW_MIN_HEIGHT = '32px';
const SEPARATOR_COLOR = 'divider';
const SEPARATOR_WIDTH = '1px';

// Componente Paper estilizado minimalista con fondo del tema
const GeometricPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  padding: theme.spacing(0.05, 1.5), // padding horizontal unificado
  border: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(240,240,240,1)',
  boxShadow: '0 1px 0 0 rgba(0,0,0,0.18)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  transition: 'all 0.2s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '14px',
  '&:hover': {
    backgroundColor: 'rgba(40,40,40,1)',
  }
}));

// Componente Paper específico para elementos más compactos
const CompactPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  padding: theme.spacing(0.03, 0.5),
  border: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(240,240,240,1)',
  boxShadow: '0 1px 0 0 rgba(0,0,0,0.18)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  transition: 'all 0.2s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '12px',
  '&:hover': {
    backgroundColor: 'rgba(40,40,40,1)',
  }
}));

// Chip estilizado geométrico
const GeometricChip = styled(Chip)(({ theme, customcolor }) => ({
  borderRadius: 0,
  backgroundColor: customcolor || theme.palette.action.selected,
  color: theme.palette.text.primary,
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 24,
  '& .MuiChip-icon': {
    fontSize: '0.9rem',
    marginLeft: theme.spacing(0.5)
  }
}));

// Componente base para filas/secciones
const EntitySectionRow = ({
  icon: Icon = InfoIcon,
  primary,
  secondary,
  children,
  sx = {},
  ...props
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minHeight: '32px',
      px: 1,
      py: 0.5,
      ...sx
    }}
    {...props}
  >
    <Icon sx={{ fontSize: '1.2rem', color: 'text.secondary', flexShrink: 0 }} />
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {primary}
      </Typography>
      {secondary && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {secondary}
        </Typography>
      )}
    </Box>
    {children}
  </Box>
);

// Componente estandarizado para encabezado de entidad con título y estado y acciones a la derecha
const EntityHeader = ({ title, estado, tipoEntidad = 'PROPIEDAD', icon: Icon, iconColor, actions }) => (
  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
    {/* Columna izquierda: ícono, título, chip de estado */}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1 }}>
      {Icon && (
        <Icon sx={{ fontSize: '1.2rem', color: iconColor, flexShrink: 0, mt: 0.2 }} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {estado && <EstadoChip estado={estado} tipo={tipoEntidad} />}
      </Box>
    </Box>
    {/* Columna derecha: acciones */}
    {actions && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {actions}
      </Box>
    )}
  </Box>
);

// Encabezado unificado para todas las secciones primarias
const PrimarySectionHeader = ({ icon: Icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: SECTION_GAP, mb: SECTION_GAP, pl: SECTION_PADDING_X, minHeight: ROW_MIN_HEIGHT }}>
    {Icon && <Icon sx={{ fontSize: '1.1rem', color: 'primary.main', flexShrink: 0 }} />}
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.95rem', letterSpacing: 0.1 }}>
      {title}
    </Typography>
  </Box>
);

// Configuraciones pre-definidas para secciones estándar
const SECTION_CONFIGS = {
  // Sección financiera estándar (primaria)
  financiero: (simboloMoneda, nombreCuenta, datosAdicionales = []) => {
    // Extraer datos adicionales
    const montoMensual = datosAdicionales[0]?.value || '';
    const deposito = datosAdicionales[1]?.value || '';
    const totalContrato = datosAdicionales[2]?.value || '';
    return {
      type: 'primary',
      left: [
        {
          icon: null, // Sin ícono, solo el símbolo de moneda
          label: 'Moneda',
          value: simboloMoneda || '$',
          subtitle: nombreCuenta || 'No especificada',
          color: 'text.secondary',
          position: 'left',
          showLargeCurrency: true // Flag especial para mostrar moneda grande
        }
      ],
      right: [
        {
          icon: MoneyIcon,
          label: 'Montos',
          value: [montoMensual, totalContrato], // Ahora muestra mensual y total
          color: 'text.secondary',
          position: 'right'
        }
      ]
    };
  },

  // Sección de ubicación estándar (primaria)
  ubicacion: (propiedad) => {
    if (!propiedad) {
      return {
        type: 'primary',
        left: [],
        right: [],
        hidden: true
      };
    }

    const getIconoPropiedad = (tipo) => {
      const iconMap = {
        'CASA': HomeIcon,
        'DEPARTAMENTO': ApartmentIcon,
        'APARTAMENTO': ApartmentIcon,
        'LOCAL': StoreOutlined
      };
      return iconMap[tipo?.toUpperCase()] || HomeIcon;
    };

    // Solo mostrar si hay dirección o ciudad
    if (!propiedad.direccion && !propiedad.ciudad) {
      return {
        type: 'primary',
        left: [],
        right: [],
        hidden: true
      };
    }

    return {
      type: 'primary',
      left: [
        {
          icon: getIconoPropiedad(propiedad.tipo),
          label: 'Ubicación',
          value: [propiedad.direccion, propiedad.ciudad].filter(Boolean).join(', '),
          color: 'primary.main',
          position: 'left'
        }
      ],
      right: [
        {
          icon: AreaIcon,
          label: 'Superficie',
          value: propiedad.metrosCuadrados ? `${propiedad.metrosCuadrados}m²` : 'No especificada',
          color: 'text.secondary',
          position: 'right'
        }
      ]
    };
  },

  // Sección de inquilinos estándar (primaria)
  inquilinos: (inquilinos) => ({
    type: 'primary',
    left: [
      {
        icon: PeopleIcon,
        value: inquilinos.length
          ? inquilinos.map(i => `${i.nombre} ${i.apellido}`).join(', ')
          : 'Ninguno',
        subtitle: 'Inquilinos',
        color: 'text.secondary'
      }
    ]
  }),

  documentos: (documentos) => ({
    type: 'primary',
    left: [
      {
        icon: DescriptionIcon,
        value: 'Documentos',
        color: 'text.secondary',
        documentos
      }
    ],
    documentos
  }),

  // Sección de tiempo estándar (secundaria)
  tiempo: (diasRestantes, duracionTotal) => ({
    type: 'secondary',
    data: [
      {
        icon: CalendarIcon,
        label: 'Restantes',
        value: diasRestantes ? `${diasRestantes} días` : 'Finalizado',
        color: 'warning.main'
      },
      {
        icon: ScheduleIcon,
        label: 'Duración',
        value: duracionTotal || 'No especificada',
        color: 'info.main'
      }
    ]
  }),

  // Sección de inventario estándar (secundaria)
  inventario: (items = []) => ({
    type: 'secondary',
    data: items.map(item => ({
      icon: item.icon || DepositIcon,
      label: item.label || 'Item',
      value: item.value || 'No especificado',
      color: item.color || 'text.secondary'
    }))
  }),

  // Sección de resumen de inventario (primaria)
  resumenInventario: (inventario = []) => {
    const totalItems = inventario.length;
    // Determinar el texto a mostrar
    const textoInventario = totalItems === 0 
      ? 'Sin inventario' 
      : totalItems === 1 
        ? '1 elemento' 
        : `${totalItems} elementos`;
    return {
      type: 'primary',
      left: [
        {
          icon: InventoryIcon,
          label: 'Inventario',
          value: textoInventario,
          color: 'text.secondary',
          position: 'left'
        }
      ]
      // No right column
    };
  },

  // Sección de habitaciones en cuadrados (especial)
  habitaciones: (habitaciones = [], inventarios = []) => {
    // Función para mapear tipos de habitación a íconos de Material-UI
    const getHabitacionIcon = (tipo) => {
      const iconMap = {
        'BAÑO': BathtubIcon,
        'TOILETTE': BathtubIcon,
        'DORMITORIO_DOBLE': KingBed,
        'DORMITORIO_SIMPLE': SingleBed,
        'ESTUDIO': ChairOutlined,
        'COCINA': KitchenOutlined,
        'DESPENSA': InventoryIcon,
        'SALA_PRINCIPAL': ChairOutlined,
        'PATIO': HomeOutlined,
        'JARDIN': HomeOutlined,
        'TERRAZA': HomeOutlined,
        'LAVADERO': LocalLaundryServiceOutlined,
        'OTRO': BedIcon
      };
      return iconMap[tipo] || BedIcon;
    };

    // Usar la función centralizada para contar items por habitación
    const habitacionesConItems = contarItemsPorHabitacion(habitaciones, inventarios);

    return {
    type: 'habitaciones',
      data: habitacionesConItems.map(habitacion => ({
        icon: getHabitacionIcon(habitacion.tipo),
      label: habitacion.tipo || 'Habitación',
        value: habitacion.nombrePersonalizado || (habitacion.tipo?.replace('_', ' ') || 'Sin nombre').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      color: habitacion.color || 'text.secondary',
        metrosCuadrados: habitacion.metrosCuadrados,
        itemsCount: habitacion.itemsCount
    }))
    };
  }
};

// Componente para renderizar sección con layout izquierda/derecha
const SectionRenderer = ({ section, isCollapsed = false, onContratoDetail = null, inquilinos = [], onInquilinoDetail = null }) => {
  if (section.hidden) return null;

  // Detectar si es sección especial (ubicación, finanzas, inquilinos/contratos) que usan value como array o string
  const isSpecial = section.left && section.left.length === 1 && (Array.isArray(section.left[0]?.value) || typeof section.left[0]?.value === 'string');

  // Si es sección financiera, mostrar monto mensual arriba y depósito abajo, con estilos distintos
  const isFinanciera = isSpecial && section.left[0]?.label === 'Moneda' && section.right?.[0]?.label === 'Montos';
  const isFinancieraLarge = isFinanciera && section.left[0]?.showLargeCurrency;
  
  // Si es sección de tiempo con números grandes
  const isTiempoLarge = section.left[0]?.showLargeNumber && section.right?.[0]?.showLargeNumber;
  
  // Si es sección de inquilinos estándar (PeopleIcon)
  const isInquilinos = section.left && section.left.length === 1 && section.left[0]?.icon === PeopleIcon;
  if (isInquilinos) {
    // Obtener la entidad (propiedad o contrato) desde section.entity si está disponible
    let inquilinosArr = [];
    if (section.entity) {
      if (section.entity.contratos || section.entity.inquilinos) {
        inquilinosArr = getInquilinosByPropiedad(section.entity);
      } else if (section.entity.inquilino) {
        inquilinosArr = getInquilinosByContrato(section.entity);
      }
    } else if (Array.isArray(inquilinos) && inquilinos.length > 0) {
      inquilinosArr = inquilinos;
    } else if (typeof section.left[0].value === 'string' && section.left[0].value !== 'Ninguno') {
      inquilinosArr = section.left[0].value.split(',').map(n => ({ nombre: n.trim(), apellido: '' }));
    }
    // Si no hay inquilinos, mostrar mensaje
    if (!inquilinosArr.length) {
      return (
        <GeometricPaper sx={{ minHeight: '40px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
            <PeopleIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Sin inquilinos
            </Typography>
          </Box>
        </GeometricPaper>
      );
    }
    // Mostrar los inquilinos en una sola línea friendly
    const maxToShow = 3;
    const nombres = inquilinosArr.map(i => `${i.nombre} ${i.apellido}`.trim()).filter(Boolean);
    const friendly = nombres.slice(0, maxToShow).join(', ') + (nombres.length > maxToShow ? ` +${nombres.length - maxToShow} más` : '');
    return (
      <GeometricPaper sx={{ minHeight: '40px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
          <PeopleIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
            {friendly}
          </Typography>
        </Box>
      </GeometricPaper>
    );
  } else if (isFinancieraLarge) {
    // Nueva versión con símbolo de moneda grande a la izquierda
    const simboloMoneda = section.left[0]?.value || '$';
    const nombreCuenta = section.left[0]?.subtitle || 'No especificada';
    const iconRight = section.right?.[0]?.icon;
    const valuesRight = Array.isArray(section.right?.[0]?.value) ? section.right?.[0]?.value : [section.right?.[0]?.value];
    
    return (
      <GeometricPaper sx={{ minHeight: '40px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
          {/* Columna 1: Símbolo de moneda y cuenta */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: '1.2rem',
                lineHeight: 1,
                m: 0,
                color: 'text.primary'
              }}
            >
              {simboloMoneda}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1,
                m: 0,
                textAlign: 'center'
              }}
            >
              {nombreCuenta}
            </Typography>
          </Box>
          
          {/* Separador vertical */}
          <Box sx={{ 
            width: '1px', 
            backgroundColor: 'divider',
            mx: 1,
            height: '60%'
          }} />
          
          {/* Columna 2: Monto mensual */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3
          }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.8rem',
                lineHeight: 1,
                m: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}
            >
              {valuesRight[0] || ''}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1,
                m: 0,
                textAlign: 'center'
              }}
            >
              mensual
            </Typography>
          </Box>
          
          {/* Separador vertical */}
          <Box sx={{ 
            width: '1px', 
            backgroundColor: 'divider',
            mx: 1,
            height: '60%'
          }} />
          
          {/* Columna 3: Monto total */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3
          }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.8rem',
                lineHeight: 1,
                m: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}
            >
              {valuesRight[1] || ''}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1,
                m: 0,
                textAlign: 'center'
              }}
            >
              total
            </Typography>
          </Box>
        </Box>
      </GeometricPaper>
    );
  } else if (isTiempoLarge) {
    // Nueva versión con números grandes para la sección de tiempo
    const valorIzquierda = section.left[0]?.value || '0';
    const subtituloIzquierda = section.left[0]?.subtitle || '';
    const valorDerecha = section.right?.[0]?.value || '0';
    const subtituloDerecha = section.right?.[0]?.subtitle || '';
    
    return (
      <GeometricPaper sx={{ minHeight: '40px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
          {/* Número grande y etiqueta izquierda */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: '1.4rem',
                lineHeight: 1,
                m: 0,
                color: 'text.primary'
              }}
            >
              {valorIzquierda}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1,
                m: 0,
                textAlign: 'center'
              }}
            >
              {subtituloIzquierda}
            </Typography>
          </Box>
          {/* Número grande y etiqueta derecha */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.3
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: '1.4rem',
                lineHeight: 1,
                m: 0,
                color: 'text.primary'
              }}
            >
              {valorDerecha}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1,
                m: 0,
                textAlign: 'center'
              }}
            >
              {subtituloDerecha}
            </Typography>
          </Box>
        </Box>
      </GeometricPaper>
    );
  } else if (isFinanciera) {
    const iconLeft = section.left[0]?.icon;
    const colorLeft = section.left[0]?.color;
    const valuesLeft = Array.isArray(section.left[0]?.value) ? section.left[0]?.value : [section.left[0]?.value];
    const iconRight = section.right?.[0]?.icon;
    const colorRight = section.right?.[0]?.color;
    const valuesRight = Array.isArray(section.right?.[0]?.value) ? section.right?.[0]?.value : [section.right?.[0]?.value];
    // Monto mensual y depósito
    const montoMensual = valuesRight[0] || '';
    const deposito = valuesRight[1] || '';
    return (
      <GeometricPaper sx={{ minHeight: '40px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
          {/* Ícono izquierda */}
          {iconLeft && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', pr: 1.5, minWidth: 28 }}>
              {React.createElement(iconLeft, { sx: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)' } })}
            </Box>
          )}
          {/* Valores izquierda */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4, justifyContent: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  m: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
              {section.left[0]?.value}
              </Typography>
            {section.left[0]?.subtitle && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 400,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1,
                  m: 0,
                  mt: 0.2
                }}
              >
                {section.left[0]?.subtitle}
              </Typography>
            )}
          </Box>
          {/* Ícono derecha */}
          {iconRight && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', pl: 1.5, minWidth: 28 }}>
              {React.createElement(iconRight, { sx: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)' } })}
            </Box>
          )}
          {/* Monto mensual y depósito en dos líneas */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4, justifyContent: 'center', alignItems: 'flex-start' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  m: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
              {section.right[0]?.value}
              </Typography>
            {section.right[0]?.subtitle && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 400,
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1,
                  m: 0,
                  mt: 0.2
                }}
              >
                {section.right[0]?.subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </GeometricPaper>
    );
  }

  // Si es locación, separar dirección y ciudad en dos líneas con estilos distintos
  const isLocacion = isSpecial && section.left[0]?.label === 'Ubicación';

  if (isLocacion) {
    const iconLeft = section.left[0]?.icon;
    const colorLeft = section.left[0]?.color;
    const ubicacionValue = section.left[0]?.value || '';
    // Separar dirección y ciudad
    let direccion = '', ciudad = '';
    if (typeof ubicacionValue === 'string') {
      [direccion, ciudad] = ubicacionValue.split(',').map(s => s.trim());
    } else if (Array.isArray(ubicacionValue)) {
      [direccion, ciudad] = ubicacionValue;
    }
    const metrosCuadrados = section.right?.[0]?.value || '';
    return (
      <GeometricPaper sx={{ minHeight: '40px', px: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Izquierda: ícono + dirección/ciudad */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {iconLeft && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {React.createElement(iconLeft, { sx: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)' } })}
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {direccion && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    lineHeight: 1,
                    m: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: { xs: 120, sm: 200, md: 260 }
                  }}
                >
                  {direccion}
                </Typography>
              )}
              {ciudad && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 400,
                    fontSize: '0.68rem',
                    color: 'text.secondary',
                    lineHeight: 1,
                    m: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: { xs: 120, sm: 200, md: 260 }
                  }}
                >
                  {ciudad}
                </Typography>
              )}
            </Box>
          </Box>
          {/* Derecha: metros cuadrados */}
          {metrosCuadrados && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.7rem',
                color: 'text.secondary',
                textAlign: 'right',
                minWidth: 60
              }}
            >
              {metrosCuadrados}
            </Typography>
          )}
        </Box>
      </GeometricPaper>
    );
  }

  // Lógica especial para sección de documentos
  const isDocumentos = section.left && section.left.length === 1 && section.left[0]?.icon === DescriptionIcon;
  if (isDocumentos) {
    const documentos = section.documentos || section.left[0].documentos || [];
    const [inquilinoDetailOpen, setInquilinoDetailOpen] = React.useState(false);
    const [selectedInquilino, setSelectedInquilino] = React.useState(null);
    const [contratoDetailOpen, setContratoDetailOpen] = React.useState(false);
    const [selectedContrato, setSelectedContrato] = React.useState(null);
    const handleOpenInquilino = (inquilino) => {
      setSelectedInquilino(inquilino);
      setInquilinoDetailOpen(true);
    };
    const handleCloseInquilino = () => {
      setInquilinoDetailOpen(false);
      setSelectedInquilino(null);
    };
    const handleOpenContrato = (contrato) => {
      setSelectedContrato(contrato);
      setContratoDetailOpen(true);
    };
    const handleCloseContrato = () => {
      setContratoDetailOpen(false);
      setSelectedContrato(null);
    };
    return (
      <GeometricPaper sx={{ minHeight: SECTION_MIN_HEIGHT, px: SECTION_PADDING_X, py: SECTION_PADDING_Y, display: 'flex', flexDirection: 'column', gap: SECTION_GAP }}>
        {documentos.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
            No hay documentos
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            {documentos.map((doc, idx) => {
              let IconoDoc = DescriptionIcon;
              let label = doc.nombre;
              let secondary = '';
              if (doc.categoria === 'CONTRATO' || doc.tipo === 'CONTRATO') {
                IconoDoc = DriveIcon;
                const apellido = getApellidoInquilinoContrato(doc);
                const rango = doc.fechaInicio && doc.fechaFin ? calcularRangoMesesContrato(doc.fechaInicio, doc.fechaFin) : '';
                label = apellido;
                secondary = rango;
              }
              // Iconos de acción a la derecha
              const inquilino = doc.inquilino && Array.isArray(doc.inquilino) ? doc.inquilino[0] : doc.inquilino;
              const contrato = doc;
              return (
                <EntitySectionRow
                  key={doc._id || idx}
                  icon={IconoDoc}
                  primary={label}
                  secondary={secondary}
                  children={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {(doc.categoria === 'CONTRATO' || doc.tipo === 'CONTRATO') && (
                        <>
                          {inquilino && (
                            <IconButton size="small" sx={{ p: 0.2 }} onClick={() => handleOpenInquilino(inquilino)}>
                              {React.createElement(icons.person, { sx: { fontSize: '1rem', color: 'primary.main' } })}
                            </IconButton>
                          )}
                          <IconButton size="small" sx={{ p: 0.2 }} onClick={() => handleOpenContrato(contrato)}>
                            {React.createElement(icons.description, { sx: { fontSize: '1rem', color: 'primary.main' } })}
                          </IconButton>
                          {/* Botón de inventario */}
                          {doc.inventario ? (
                            <IconButton size="small" sx={{ p: 0.2, color: 'text.secondary' }} onClick={() => onInventarioClick && onInventarioClick(doc)}>
                              {React.createElement(icons.inventario, { sx: { fontSize: '1rem' } })}
                            </IconButton>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', p: 0.2, color: 'text.disabled' }}>
                              {React.createElement(icons.inventario, { sx: { fontSize: '1rem' } })}
                            </Box>
                          )}
                        </>
                      )}
                      {doc.url && (doc.categoria !== 'CONTRATO' && doc.tipo !== 'CONTRATO') && (
                        <IconButton size="small" href={doc.url} target="_blank" rel="noopener noreferrer" sx={{ p: 0.2 }}>
                          <ViewIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                        </IconButton>
                      )}
                    </Box>
                  }
                  sx={{ minHeight: ROW_MIN_HEIGHT, pl: 1 }}
                />
              );
            })}
          </Box>
        )}
        {/* Popups de detalle */}
        {selectedInquilino && (
          <InquilinoDetail open={inquilinoDetailOpen} onClose={handleCloseInquilino} inquilino={selectedInquilino} />
        )}
        {selectedContrato && (
          <ContratoDetail open={contratoDetailOpen} onClose={handleCloseContrato} contrato={selectedContrato} />
        )}
      </GeometricPaper>
    );
  }

  // Para todas las secciones primarias estándar, usar encabezado y layout unificado
  const isPrimarySection = section.type === 'primary' && !isSpecial && !isDocumentos;
  if (isPrimarySection) {
    const hasLeft = (section.left || []).length > 0;
    const hasRight = (section.right || []).length > 0;
    return (
      <GeometricPaper sx={{ minHeight: SECTION_MIN_HEIGHT, px: SECTION_PADDING_X, py: SECTION_PADDING_Y, display: 'flex', flexDirection: 'column', gap: SECTION_GAP }}>
        <PrimarySectionHeader icon={section.left[0]?.icon} title={section.left[0]?.label || ''} />
        <Box sx={{ display: 'flex', width: '100%' }}>
          {/* Columna izquierda */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(section.left || []).map((item, index) => (
              <EntitySectionRow key={index} icon={item.icon} primary={item.value} secondary={item.subtitle} sx={{ minHeight: ROW_MIN_HEIGHT }} />
            ))}
          </Box>
          {/* Separador vertical solo si hay ambas columnas */}
          {hasLeft && hasRight && (
            <Box sx={{ width: SEPARATOR_WIDTH, backgroundColor: SEPARATOR_COLOR, mx: 1 }} />
          )}
          {/* Columna derecha */}
          {hasRight && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(section.right || []).map((item, index) => (
                <EntitySectionRow key={index} icon={item.icon} primary={item.value} secondary={item.subtitle} sx={{ minHeight: ROW_MIN_HEIGHT }} />
              ))}
            </Box>
          )}
        </Box>
      </GeometricPaper>
    );
  }

  return (
    <GeometricPaper sx={{ minHeight: SECTION_MIN_HEIGHT, px: SECTION_PADDING_X, py: SECTION_PADDING_Y, display: 'flex', flexDirection: 'column', gap: SECTION_GAP }}>
      <Box sx={{ 
        display: 'flex', 
        height: '100%',
        width: '100%'
      }}>
        {/* Parte izquierda */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          pr: 1
        }}>
          {(section.left || []).map((item, index) => (
            <EntitySectionRow key={index} icon={item.icon} primary={item.value} secondary={item.subtitle} />
          ))}
        </Box>
        {/* Separador vertical solo si hay ambas columnas */}
        {(section.left || []).length > 0 && (section.right || []).length > 0 && (
          <Box sx={{ 
            width: SEPARATOR_WIDTH, 
            backgroundColor: SEPARATOR_COLOR,
            mx: 1
          }} />
        )}
        {/* Parte derecha */}
        {(section.right || []).length > 0 && (
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            pl: 1
          }}>
            {(section.right || []).map((item, index) => (
              <EntitySectionRow key={index} icon={item.icon} primary={item.value} secondary={item.subtitle} />
            ))}
          </Box>
        )}
      </Box>
    </GeometricPaper>
  );
};

// Componente para renderizar sección secundaria
const SecondarySectionRenderer = ({ section, isCollapsed = false }) => {
  if (isCollapsed) return null;

  return (
    <GeometricPaper sx={{ minHeight: SECTION_MIN_HEIGHT, px: SECTION_PADDING_X, py: SECTION_PADDING_Y, display: 'flex', flexDirection: 'column', gap: SECTION_GAP }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 0,
        height: '100%',
        width: '100%'
      }}>
        {section.data.map((item, itemIndex) => (
          <EntitySectionRow
            key={itemIndex}
            icon={item.icon}
            primary={item.value}
            secondary={item.label}
          />
        ))}
      </Box>
    </GeometricPaper>
  );
};

// Componente para mostrar secciones estándar organizadas
const StandardSections = ({ sections, gridSize = { xs: 6, sm: 6, md: 6, lg: 6 }, isCollapsed = false, onContratoDetail = null, inquilinos = [], onInquilinoDetail = null }) => {
  // Secciones estándar
  const seccionesPrimarias = sections.filter(s => s.type === 'primary' && !s.hidden);
  const seccionesSecundarias = sections.filter(s => s.type === 'secondary');
  const seccionesHabitaciones = sections.filter(s => s.type === 'habitaciones');
  // Secciones custom (con campo render)
  const seccionesCustom = sections.filter(s => typeof s.render === 'function');

  return (
    <Box>
      {/* Fila para cada sección primaria */}
      {seccionesPrimarias.map((section, sectionIndex) => (
        <Grid container spacing={0.3} sx={{ p: 0, mb: 1 }} key={`primary-row-${section.type}-${section.left?.[0]?.label || sectionIndex}`}>
          <Grid item {...gridSize}>
            <SectionRenderer section={section} isCollapsed={isCollapsed} onContratoDetail={onContratoDetail} inquilinos={inquilinos} onInquilinoDetail={onInquilinoDetail} />
          </Grid>
        </Grid>
      ))}

      {/* Fila para cada sección de habitaciones */}
      {seccionesHabitaciones.map((section, sectionIndex) => (
        <Grid container spacing={0.3} sx={{ p: 0, mb: 1 }} key={`habitaciones-row-${sectionIndex}`}>
          <Grid item xs={12}>
            <HabitacionesRenderer section={section} isCollapsed={isCollapsed} />
          </Grid>
        </Grid>
      ))}

      {/* Fila para cada sección secundaria */}
      {seccionesSecundarias.map((section, sectionIndex) => (
        <Grid container spacing={0.3} sx={{ p: 0, mb: 1 }} key={`secondary-row-${sectionIndex}`}>
          <Grid item {...gridSize}>
            <SecondarySectionRenderer section={section} isCollapsed={isCollapsed} />
          </Grid>
        </Grid>
      ))}

      {/* Fila para cada sección custom */}
      {seccionesCustom.map((section, sectionIndex) => (
        <Grid container spacing={0.3} sx={{ p: 0, mb: 1 }} key={`custom-row-${sectionIndex}`}>
          <Grid item xs={12}>
            <GeometricPaper>
              {section.render()}
            </GeometricPaper>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

// Componente individual para elementos con hover horizontal
const EntityCard = ({ 
  item, 
  config, 
  isCompact = false,
  linkTo = null,
  gridSize = { xs: 6, sm: 6, md: 6, lg: 6 }
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const PaperComponent = isCompact ? CompactPaper : GeometricPaper;
  
  const cardContent = (
    <PaperComponent
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ cursor: linkTo ? 'pointer' : 'default', minHeight: isCompact ? '40px' : '50px' }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        height: '100%',
        width: '100%'
      }}>
        {/* Icono a la izquierda */}
        {config.getIcon && (() => {
          const IconComponent = config.getIcon(item);
          return (
            <IconComponent 
              sx={{ 
                fontSize: isCompact ? '1rem' : '1.2rem', 
                color: config.getIconColor ? config.getIconColor(item) : 'text.primary',
                flexShrink: 0
              }} 
            />
          );
        })()}
        
        {/* Contenido a la derecha */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0,
          flex: 1,
          overflow: 'hidden'
        }}>
          {!isHovered ? (
            // Vista normal
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: isCompact ? '0.6rem' : '0.7rem',
                  lineHeight: 1,
                  m: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {config.getTitle(item)}
              </Typography>
              {config.getSubtitle && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                  {config.getSubtitle(item)}
                </Typography>
              )}
            </>
          ) : (
            // Vista hover
            <>
              <Typography variant="body2" sx={{ fontSize: isCompact ? '0.65rem' : '0.7rem', fontWeight: 600, color: 'primary.main' }}>
                {config.getTitle(item)}
              </Typography>
              {config.getHoverInfo && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'warning.main' }}>
                  {config.getHoverInfo(item)}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </PaperComponent>
  );

  if (linkTo) {
    return (
      <Box component={Link} to={linkTo} sx={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Box>
    );
  }

  return cardContent;
};

// Componente para mostrar elementos en grid con paginación opcional
const EntityGrid = ({ 
  items, 
  config, 
  isCompact = false,
  fixedSlots = null,
  itemsPerPage = null,
  gridSize = { xs: 6, sm: 6, md: 6, lg: 6 },
  emptyMessage = "No hay elementos registrados"
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  if (!items || items.length === 0) {
    if (fixedSlots) {
      return (
        <Box sx={{ position: 'relative', minHeight: isCompact ? '104px' : '120px' }}>
          <Grid container spacing={0.3} sx={{ p: 0 }}>
            {Array.from({ length: fixedSlots }).map((_, index) => (
              <Grid item {...gridSize} key={`empty-${index}`}>
                <CompactPaper sx={{ 
                  minHeight: isCompact ? '40px' : '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {index === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                      {emptyMessage}
                    </Typography>
                  )}
                </CompactPaper>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
    
    return (
      <Box sx={{ 
        p: 1.5, 
        textAlign: 'center'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  let displayItems = items;
  let totalPages = 1;

  if (itemsPerPage && fixedSlots) {
    totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);
    
    // Crear array de elementos fijos, rellenando con null los espacios vacíos
    displayItems = Array.from({ length: fixedSlots }, (_, index) => 
      currentItems[index] || null
    );
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        minHeight: isCompact ? '104px' : '120px',
        paddingRight: totalPages > 1 ? '24px' : '0px'
      }}>
        <Grid container spacing={0.3} sx={{ p: 0 }}>
          {displayItems.map((item, index) => (
            <Grid item {...gridSize} key={item?._id || item?.id || `slot-${index}`}>
              {item ? (
                <EntityCard 
                  item={item} 
                  config={config} 
                  isCompact={isCompact}
                  linkTo={config.getLinkTo ? config.getLinkTo(item) : null}
                />
              ) : (
                <CompactPaper sx={{ 
                  minHeight: isCompact ? '40px' : '50px',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}>
                  {/* Espacio vacío para mantener la estructura */}
                </CompactPaper>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Flecha sutil para más elementos */}
      {totalPages > 1 && (
        <Box 
          onClick={handleNextPage}
          sx={{ 
            position: 'absolute',
            right: 0,
            top: '12px',
            width: '20px',
            height: '80px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderLeft: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <Typography 
            sx={{ 
              fontSize: '0.9rem', 
              color: 'text.secondary',
              transform: 'rotate(90deg)',
              userSelect: 'none',
              fontWeight: 400
            }}
          >
            ›
          </Typography>
        </Box>
      )}
      
      {/* Indicador de página */}
      {totalPages > 1 && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 6, 
          right: 28, 
          display: 'flex', 
          gap: 0.5 
        }}>
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <Box
              key={pageIndex}
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                backgroundColor: pageIndex === currentPage 
                  ? 'text.secondary' 
                  : 'rgba(255, 255, 255, 0.2)',
                transition: 'backgroundColor 0.2s ease'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente para mostrar información en grid horizontal
const InfoGrid = ({ data, config, gridSize = { xs: 4, sm: 4, md: 4, lg: 4 } }) => {
  return (
    <Grid container spacing={0.3} sx={{ p: 0 }}>
      {data.map((item, index) => (
        <Grid item {...gridSize} key={index}>
          <GeometricPaper sx={{ minHeight: '50px' }}>
            <EntitySectionRow
              icon={item.icon}
              primary={item.value}
              secondary={item.label}
            />
          </GeometricPaper>
        </Grid>
      ))}
    </Grid>
  );
};

// Componente para renderizar habitaciones en cuadrados con navegación
const HabitacionesRenderer = ({ section, isCollapsed = false }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(section.data.length / itemsPerPage);
  
  if (isCollapsed) return null;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = section.data.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <GeometricPaper sx={{ minHeight: '48px', position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}>


        {/* Grid de habitaciones */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1.5, py: 1, flex: 1 }}>
          {currentItems.map((habitacion, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                minHeight: '32px',
                px: 0,
                py: 0.5
              }}
            >
              {/* Ícono */}
              <Box sx={{ fontSize: '1rem', color: habitacion.color, flexShrink: 0 }}>
                {(habitacion.icon || InfoIcon) && React.createElement(habitacion.icon || InfoIcon, { sx: { fontSize: '1rem' } })}
              </Box>
              {/* Contenido: nombre y metros cuadrados */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minWidth: 0,
                flex: 1
              }}>
              {/* Nombre */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  textAlign: 'left',
                  lineHeight: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  m: 0,
                  p: 0
                }}
              >
                {habitacion.value}
              </Typography>
                {/* Metros cuadrados y cantidad de items */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {habitacion.metrosCuadrados && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    color: 'text.secondary',
                    textAlign: 'left',
                        lineHeight: 1
                  }}
                >
                  {habitacion.metrosCuadrados}m²
                </Typography>
              )}
                  {habitacion.itemsCount !== undefined && (
                    <>
                      {habitacion.metrosCuadrados && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: 'text.secondary',
                            lineHeight: 1
                          }}
                        >
                          •
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.6rem',
                          color: 'text.secondary',
                          textAlign: 'left',
                          lineHeight: 1,
                          opacity: 0.8
                        }}
                      >
                        {habitacion.itemsCount} {habitacion.itemsCount === 1 ? 'item' : 'items'}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Navegación */}
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mt: 0.5,
            px: 1.5
          }}>
            {/* Botón anterior */}
            <IconButton
              size="small"
              onClick={handlePrevPage}
              sx={{
                color: 'text.secondary',
                p: 0.25,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ExpandMoreIcon sx={{ 
                fontSize: '0.9rem', 
                transform: 'rotate(90deg)' 
              }} />
            </IconButton>

            {/* Indicadores de página */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <Box
                  key={pageIndex}
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: pageIndex === currentPage 
                      ? 'text.secondary' 
                      : 'rgba(255, 255, 255, 0.2)',
                    transition: 'backgroundColor 0.2s ease'
                  }}
                />
              ))}
            </Box>

            {/* Botón siguiente */}
            <IconButton
              size="small"
              onClick={handleNextPage}
              sx={{
                color: 'text.secondary',
                p: 0.25,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ExpandMoreIcon sx={{ 
                fontSize: '0.9rem', 
                transform: 'rotate(-90deg)' 
              }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </GeometricPaper>
  );
};

// Componente principal EntityGridView
const EntityGridView = ({ 
  type = 'list',
  data,
  config,
  title,
  showEmpty = true,
  isCompact = false,
  fixedSlots = null,
  itemsPerPage = null,
  gridSize = { xs: 6, sm: 6, md: 6, lg: 6 },
  emptyMessage = "No hay elementos registrados",
  // Nuevas props para secciones estándar
  sections = null,
  sectionGridSize = { xs: 6, sm: 6, md: 6, lg: 6 },
  isCollapsed = false,
  showCollapseButton = false,
  onToggleCollapse = null,
  // Props para manejo de contratos
  contratos = [],
  onEditContrato = null,
  onDeleteContrato = null,
  inquilinos = [],
  onInventarioClick = null // Nuevo prop para manejar el clic en el botón de inventario
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [inquilinoDetailOpen, setInquilinoDetailOpen] = useState(false);
  const [selectedInquilino, setSelectedInquilino] = useState(null);

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    }
  };

  const handleContratoDetail = (contratoId) => {
    const contrato = contratos.find(c => c._id === contratoId);
    if (contrato) {
      setSelectedContrato(contrato);
      setDetailOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedContrato(null);
  };

  const handleEditContrato = (contrato) => {
    if (onEditContrato) {
      onEditContrato(contrato);
    }
    handleCloseDetail();
  };

  const handleDeleteContrato = (contratoId) => {
    if (onDeleteContrato) {
      onDeleteContrato(contratoId);
    }
    handleCloseDetail();
  };

  const handleInquilinoDetail = (inquilinoId) => {
    const inq = inquilinos.find(i => i._id === inquilinoId);
    if (inq) {
      setSelectedInquilino(inq);
      setInquilinoDetailOpen(true);
    }
  };

  const handleCloseInquilinoDetail = () => {
    setInquilinoDetailOpen(false);
    setSelectedInquilino(null);
  };

  const renderContent = () => {
    switch (type) {
      case 'list':
        return (
          <EntityGrid 
            items={data} 
            config={config}
            isCompact={isCompact}
            fixedSlots={fixedSlots}
            itemsPerPage={itemsPerPage}
            gridSize={gridSize}
            emptyMessage={emptyMessage}
          />
        );
      case 'info':
        return <InfoGrid data={data} config={config} gridSize={gridSize} />;
      case 'sections':
        return <StandardSections sections={sections} gridSize={sectionGridSize} isCollapsed={collapsed} onContratoDetail={handleContratoDetail} inquilinos={inquilinos} onInquilinoDetail={handleInquilinoDetail} />;
      case 'habitaciones':
        return <HabitacionesRenderer section={data} isCollapsed={collapsed} />;
      default:
        return (
          <Box sx={{ 
            p: 1.5, 
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Tipo de vista no reconocido: {type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header con título y botón de colapsar */}
      {(title || showCollapseButton) && (
        <Box sx={{ 
          mb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {showCollapseButton && (
            <IconButton
              onClick={handleToggleCollapse}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          )}
        </Box>
      )}
      
      {/* Contenido */}
      {renderContent()}
      
      {/* Popup de detalle de contrato */}
      {selectedContrato && (
        <ContratoDetail
          open={detailOpen}
          onClose={handleCloseDetail}
          contrato={selectedContrato}
          onEdit={handleEditContrato}
          onDelete={handleDeleteContrato}
          relatedData={{}}
        />
      )}
      {/* Popup de detalle de inquilino */}
      {selectedInquilino && (
        <InquilinoDetail
          open={inquilinoDetailOpen}
          onClose={handleCloseInquilinoDetail}
          inquilino={selectedInquilino}
        />
      )}
    </Box>
  );
};

export default EntityGridView;
export { 
  EntityCard, 
  EntityGrid, 
  InfoGrid, 
  StandardSections, 
  SectionRenderer, 
  SecondarySectionRenderer, 
  HabitacionesRenderer,
  GeometricPaper, 
  CompactPaper, 
  GeometricChip, 
  EntityHeader,
  SECTION_CONFIGS 
}; 
