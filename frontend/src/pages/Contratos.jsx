import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Button,
  Box,
  Grid,
  Paper,
  Chip,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { 
  ApartmentOutlined as BuildingIcon,
  BedOutlined as BedIcon,
  PeopleOutlined as PeopleIcon,
  Inventory2Outlined as InventoryIcon,
  DescriptionOutlined as DescriptionIcon,
  CalendarTodayOutlined as CalendarIcon,
  AttachMoneyOutlined as MoneyIcon,
  HomeWorkOutlined as HomeIcon,
  PersonOutlineOutlined as PersonIcon
} from '@mui/icons-material';
import EntityToolbar from '../components/EntityToolbar';
import EntityDetails from '../components/EntityViews/EntityDetails';
import EntityForm from '../components/EntityViews/EntityForm';
import { useSnackbar } from 'notistack';
import clienteAxios from '../config/axios';
import EmptyState from '../components/EmptyState';
import { EntityActions } from '../components/EntityViews/EntityActions';
import EntityCards from '../components/EntityViews/EntityCards';

export function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchContratos = useCallback(async () => {
    try {
      const response = await clienteAxios.get('/contratos');
      setContratos(response.data.docs || []);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      enqueueSnackbar('Error al cargar contratos', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchPropiedades = useCallback(async () => {
    try {
      const response = await clienteAxios.get('/propiedades');
      setPropiedades(response.data.docs || []);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      enqueueSnackbar('Error al cargar propiedades', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchInquilinos = useCallback(async () => {
    try {
      const response = await clienteAxios.get('/inquilinos');
      setInquilinos(response.data.docs || []);
    } catch (error) {
      console.error('Error al cargar inquilinos:', error);
      enqueueSnackbar('Error al cargar inquilinos', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchMonedas = useCallback(async () => {
    try {
      const response = await clienteAxios.get('/monedas');
      setMonedas(response.data.docs || []);
    } catch (error) {
      console.error('Error al cargar monedas:', error);
      enqueueSnackbar('Error al cargar monedas', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchContratos();
    fetchPropiedades();
    fetchInquilinos();
    fetchMonedas();
  }, [fetchContratos, fetchPropiedades, fetchInquilinos, fetchMonedas]);

  const handleCreatePropiedad = async (data) => {
    try {
      const response = await clienteAxios.post('/propiedades', data);
      setPropiedades(prev => [...prev, response.data]);
      enqueueSnackbar('Propiedad creada exitosamente', { variant: 'success' });
      return response.data;
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      enqueueSnackbar('Error al crear la propiedad', { variant: 'error' });
      throw error;
    }
  };

  const handleCreateInquilino = async (data) => {
    try {
      const response = await clienteAxios.post('/inquilinos', data);
      setInquilinos(prev => [...prev, response.data]);
      enqueueSnackbar('Inquilino creado exitosamente', { variant: 'success' });
      return response.data;
    } catch (error) {
      console.error('Error al crear inquilino:', error);
      enqueueSnackbar('Error al crear el inquilino', { variant: 'error' });
      throw error;
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingContrato) {
        response = await clienteAxios.put(`/contratos/${editingContrato.id}`, formData);
        enqueueSnackbar('Contrato actualizado exitosamente', { variant: 'success' });
      } else {
        response = await clienteAxios.post('/contratos', formData);
        enqueueSnackbar('Contrato creado exitosamente', { variant: 'success' });
      }
      setIsFormOpen(false);
      setEditingContrato(null);
      await fetchContratos();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Error al guardar el contrato', 
        { variant: 'error' }
      );
    }
  };

  const handleEdit = useCallback((contrato) => {
    setEditingContrato(contrato);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await clienteAxios.delete(`/contratos/${id}`);
      enqueueSnackbar('Contrato eliminado exitosamente', { variant: 'success' });
      await fetchContratos();
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      enqueueSnackbar('Error al eliminar el contrato', { variant: 'error' });
    }
  }, [enqueueSnackbar, fetchContratos]);

  const formFields = [
    {
      name: 'propiedadId',
      label: 'Propiedad',
      type: 'relational',
      required: true,
      options: propiedades.map(p => ({
        value: p.id,
        label: p.titulo
      })),
      onCreateNew: handleCreatePropiedad,
      createFields: [
        { name: 'titulo', label: 'Título', required: true },
        { name: 'direccion', label: 'Dirección', required: true },
        { name: 'ciudad', label: 'Ciudad', required: true },
        { name: 'estado', label: 'Estado', required: true }
      ],
      createTitle: 'Nueva Propiedad'
    },
    {
      name: 'inquilinoId',
      label: 'Inquilino',
      type: 'relational',
      required: true,
      options: inquilinos.map(i => ({
        value: i.id,
        label: `${i.nombre} ${i.apellido}`
      })),
      onCreateNew: handleCreateInquilino,
      createFields: [
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'apellido', label: 'Apellido', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'telefono', label: 'Teléfono', required: true },
        { name: 'dni', label: 'DNI', required: true }
      ],
      createTitle: 'Nuevo Inquilino'
    },
    {
      name: 'fechaInicio',
      label: 'Fecha de Inicio',
      type: 'date',
      required: true
    },
    {
      name: 'fechaFin',
      label: 'Fecha de Fin',
      type: 'date',
      required: true
    },
    {
      name: 'montoMensual',
      label: 'Monto Mensual',
      type: 'number',
      required: true
    },
    {
      name: 'monedaId',
      label: 'Moneda',
      type: 'select',
      required: true,
      options: monedas.map(m => ({
        value: m.id,
        label: `${m.nombre} (${m.simbolo})`
      }))
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'FINALIZADO', label: 'Finalizado' },
        { value: 'CANCELADO', label: 'Cancelado' }
      ]
    },
    {
      name: 'observaciones',
      label: 'Observaciones',
      multiline: true,
      rows: 3
    }
  ];

  const cardConfig = {
    renderIcon: () => <DescriptionIcon />,
    getTitle: (contrato) => {
      const propiedad = propiedades.find(p => p.id === contrato.propiedadId);
      return propiedad?.titulo || 'N/A';
    },
    getDetails: (contrato) => [
      {
        icon: <PersonIcon />,
        text: (() => {
          const inquilino = inquilinos.find(i => i.id === contrato.inquilinoId);
          return inquilino ? `${inquilino.nombre} ${inquilino.apellido}` : 'N/A';
        })(),
        noWrap: true
      },
      {
        icon: <CalendarIcon />,
        text: `${new Date(contrato.fechaInicio).toLocaleDateString()} - ${new Date(contrato.fechaFin).toLocaleDateString()}`
      },
      {
        icon: <MoneyIcon />,
        text: (() => {
          const moneda = monedas.find(m => m.id === contrato.monedaId);
          return `${moneda?.simbolo || ''} ${contrato.montoMensual?.toLocaleString() || 0} /mes`;
        })()
      }
    ],
    getStatus: (contrato) => ({
      label: contrato.estado,
      color: contrato.estado === 'ACTIVO' ? 'success' :
             contrato.estado === 'FINALIZADO' ? 'info' : 'error'
    }),
    getActions: (contrato) => ({
      onEdit: () => handleEdit(contrato),
      onDelete: () => handleDelete(contrato.id),
      itemName: `el contrato de ${
        inquilinos.find(i => i.id === contrato.inquilinoId)?.nombre || 'N/A'
      }`
    })
  };

  return (
    <Container maxWidth="lg">
      <EntityToolbar
        onAdd={() => {
          setEditingContrato(null);
          setIsFormOpen(true);
        }}
        searchPlaceholder="Buscar contratos..."
        navigationItems={[
          {
            icon: <BuildingIcon sx={{ fontSize: 20 }} />,
            label: 'Propiedades',
            to: '/propiedades'
          },
          {
            icon: <BedIcon sx={{ fontSize: 20 }} />,
            label: 'Habitaciones',
            to: '/habitaciones'
          },
          {
            icon: <PeopleIcon sx={{ fontSize: 20 }} />,
            label: 'Inquilinos',
            to: '/inquilinos'
          },
          {
            icon: <InventoryIcon sx={{ fontSize: 20 }} />,
            label: 'Inventario',
            to: '/inventario'
          }
        ]}
      />

      <EntityDetails
        title="Contratos"
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="small"
            onClick={() => {
              setEditingContrato(null);
              setIsFormOpen(true);
            }}
            sx={{ borderRadius: 0 }}
          >
            Nuevo Contrato
          </Button>
        }
      >
        {contratos.length === 0 ? (
          <EmptyState onAdd={() => setIsFormOpen(true)} />
        ) : (
          <EntityCards 
            data={contratos}
            config={cardConfig}
            gridProps={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3
            }}
          />
        )}
      </EntityDetails>

      <EntityForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingContrato(null);
        }}
        onSubmit={handleFormSubmit}
        title={editingContrato ? 'Editar Contrato' : 'Nuevo Contrato'}
        fields={formFields}
        initialData={editingContrato || {}}
        isEditing={!!editingContrato}
      />
    </Container>
  );
}

export default Contratos; 