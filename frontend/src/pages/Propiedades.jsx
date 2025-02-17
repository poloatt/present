import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CardMedia,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, BedOutlined as BedIcon, PeopleOutlined as PeopleIcon, DescriptionOutlined as DescriptionIcon, AttachMoneyOutlined as AttachMoneyIcon, AccountBalanceWalletOutlined as AccountBalanceWalletIcon, Inventory2Outlined as InventoryIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EntityForm from '../components/EntityViews/EntityForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EntityToolbar from '../components/EntityToolbar';
import EntityDetails from '../components/EntityViews/EntityDetails';
import EntityCards from '../components/EntityViews/EntityCards';

// Cambiamos a exportación nombrada para coincidir con App.jsx
export function Propiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedPropiedad, setSelectedPropiedad] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    direccion: '',
    ciudad: '',
    estado: '',
    tipo: 'CASA',
    numHabitaciones: '',
    banos: '',
    metrosCuadrados: '',
    imagen: '',
    monedaId: '',
    cuentaId: ''
  });
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteredPropiedades, setFilteredPropiedades] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Definir la función fetchPropiedades fuera del useEffect
  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      console.log('Solicitando propiedades...');
      
      const response = await axios.get('/api/propiedades', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta recibida:', response.data);
      setPropiedades(response.data);
      setFilteredPropiedades(response.data);
      
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      setError(error.message || 'Error al cargar propiedades');
      enqueueSnackbar('Error al cargar propiedades', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropiedades();
  }, []);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [monedasRes, cuentasRes] = await Promise.all([
          axios.get('/api/monedas'),
          axios.get('/api/cuentas')
        ]);

        setMonedas(monedasRes.data);
        setCuentas(cuentasRes.data);
      } catch (error) {
        console.error('Error al cargar datos relacionados:', error);
        enqueueSnackbar('Error al cargar datos relacionados', { variant: 'error' });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, [enqueueSnackbar]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/propiedades/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al eliminar propiedad');
      
      setPropiedades(propiedades.filter(prop => prop.id !== id));
      enqueueSnackbar('Propiedad eliminada con éxito', { variant: 'success' });
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Error al eliminar propiedad', { variant: 'error' });
    }
  };

  const handleEdit = (id) => {
    const propiedad = propiedades.find(p => p.id === id);
    if (propiedad) {
      // Asegurarse de que todos los campos numéricos sean strings para el formulario
      setFormData({
        ...propiedad,
        precio: propiedad.precio.toString(),
        numHabitaciones: propiedad.numHabitaciones.toString(),
        banos: propiedad.banos.toString(),
        metrosCuadrados: propiedad.metrosCuadrados.toString(),
        monedaId: propiedad.monedaId.toString(),
        cuentaId: propiedad.cuentaId.toString()
      });
      setSelectedPropiedad(propiedad);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('Enviando datos:', formData);
      
      const datosAEnviar = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        estado: formData.estado,
        tipo: formData.tipo,
        numHabitaciones: parseInt(formData.numHabitaciones),
        banos: parseInt(formData.banos),
        metrosCuadrados: parseFloat(formData.metrosCuadrados),
        imagen: formData.imagen || null,
        monedaId: parseInt(formData.monedaId),
        cuentaId: parseInt(formData.cuentaId)
      };

      console.log('Datos procesados:', datosAEnviar);

      let response;
      if (selectedPropiedad) {
        // Si hay una propiedad seleccionada, es una edición
        response = await axios.put(`/api/propiedades/${selectedPropiedad.id}`, datosAEnviar);
        enqueueSnackbar('Propiedad actualizada exitosamente', { variant: 'success' });
      } else {
        // Si no hay propiedad seleccionada, es una creación
        response = await axios.post('/api/propiedades', datosAEnviar);
        enqueueSnackbar('Propiedad creada exitosamente', { variant: 'success' });
      }
      
      setIsFormOpen(false);
      await fetchPropiedades();
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Error al procesar la propiedad', 
        { variant: 'error' }
      );
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredPropiedades(propiedades);
      return;
    }
    
    const filtered = propiedades.filter(prop => 
      prop.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPropiedades(filtered);
  };

  const handleMultipleDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => handleDelete(id)));
      enqueueSnackbar(`${ids.length} propiedades eliminadas`, { variant: 'success' });
    } catch (error) {
      console.error('Error al eliminar múltiples propiedades:', error);
      enqueueSnackbar('Error al eliminar propiedades', { variant: 'error' });
    }
  };

  const handleCreateMoneda = async (data) => {
    const response = await axios.post('/api/monedas', data);
    setMonedas([...monedas, response.data]);
    return response.data;
  };

  const handleCreateCuenta = async (data) => {
    const response = await axios.post('/api/cuentas', {
      ...data,
      usuarioId: user.id
    });
    setCuentas([...cuentas, response.data]);
    return response.data;
  };

  const formFields = [
    {
      name: 'titulo',
      label: 'Título',
      required: true,
      onChange: (value) => setFormData({...formData, titulo: value})
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      multiline: true,
      rows: 3,
      required: true,
      onChange: (value) => setFormData({...formData, descripcion: value})
    },
    {
      name: 'precio',
      label: 'Precio',
      type: 'number',
      required: true,
      onChange: (value) => setFormData({...formData, precio: value})
    },
    {
      name: 'direccion',
      label: 'Dirección',
      required: true,
      onChange: (value) => setFormData({...formData, direccion: value})
    },
    {
      name: 'ciudad',
      label: 'Ciudad',
      required: true,
      onChange: (value) => setFormData({...formData, ciudad: value})
    },
    {
      name: 'estado',
      label: 'Estado',
      required: true,
      onChange: (value) => setFormData({...formData, estado: value})
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      value: formData.tipo || 'CASA',
      options: ['CASA', 'DEPARTAMENTO', 'OFICINA', 'LOCAL', 'TERRENO'].map(t => ({
        value: t,
        label: t
      }))
    },
    {
      name: 'numHabitaciones',
      label: 'Número de Habitaciones',
      type: 'number',
      required: true,
      onChange: (value) => setFormData({...formData, numHabitaciones: value})
    },
    {
      name: 'banos',
      label: 'Número de Baños',
      type: 'number',
      required: true,
      onChange: (value) => setFormData({...formData, banos: value})
    },
    {
      name: 'metrosCuadrados',
      label: 'Metros Cuadrados',
      type: 'number',
      required: true,
      onChange: (value) => setFormData({...formData, metrosCuadrados: value})
    },
    {
      name: 'imagen',
      label: 'Imagen',
      onChange: (value) => setFormData({...formData, imagen: value})
    },
    {
      name: 'monedaId',
      label: 'Moneda',
      component: 'creatable',
      required: true,
      variant: 'buttons',
      displaySymbol: true,
      options: monedas.map(m => ({
        value: m.id,
        label: `${m.nombre} (${m.simbolo})`,
        simbolo: m.simbolo
      })),
      onCreateNew: handleCreateMoneda,
      createFields: [
        { name: 'codigo', label: 'Código', required: true },
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'simbolo', label: 'Símbolo', required: true }
      ],
      createTitle: 'Nueva Moneda'
    },
    {
      name: 'cuentaId',
      label: 'Cuenta',
      component: 'creatable',
      required: true,
      variant: 'select',
      options: cuentas.map(c => ({
        value: c.id,
        label: `${c.nombre} - ${c.numero}`
      })),
      onCreateNew: handleCreateCuenta,
      createFields: [
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'numero', label: 'Número', required: true },
        { 
          name: 'tipo', 
          label: 'Tipo', 
          type: 'select', 
          required: true,
          options: ['EFECTIVO', 'BANCO', 'MERCADO_PAGO', 'CRIPTO', 'OTRO'].map(t => ({
            value: t,
            label: t.replace('_', ' ')
          }))
        },
        { 
          name: 'monedaId', 
          label: 'Moneda', 
          isMonedaField: true,
          required: true,
          options: monedas.map(m => ({
            value: m.id,
            label: `${m.nombre} (${m.simbolo})`,
            simbolo: m.simbolo
          }))
        }
      ],
      createTitle: 'Nueva Cuenta'
    }
  ];

  const cardConfig = {
    getTitle: (item) => item.titulo,
    getDescription: (item) => item.descripcion,
    getType: (item) => item.tipo,
    getImage: (item) => item.imagen,
    getAmount: (item) => item.precio,
    getSubtitle: (item) => item.direccion,
    getExtra: (item) => `${item.ciudad}, ${item.estado}`,
    getStatus: (item) => item.estado || 'ACTIVO',
    // Campos específicos para propiedades
    getMetrosCuadrados: (item) => item.metrosCuadrados,
    getHabitaciones: (item) => item.numHabitaciones,
    getBanos: (item) => item.banos
  };

  // Pasar el estado de propiedades a los componentes hijos
  const hasPropiedades = propiedades.length > 0;

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item key={item} xs={12} sm={6} md={4}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <EntityToolbar
        onAdd={() => setIsFormOpen(true)}
        searchPlaceholder="Buscar propiedades..."
        navigationItems={[
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
            icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
            label: 'Contratos',
            to: '/contratos'
          },
          {
            icon: <InventoryIcon sx={{ fontSize: 20 }} />,
            label: 'Inventario',
            to: '/inventario'
          }
        ]}
        disableNavigation={!hasPropiedades}
      />

      <EntityDetails 
        title="Propiedades"
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="small"
            onClick={() => setIsFormOpen(true)}
          >
            Nueva Propiedad
          </Button>
        }
      >
        {propiedades.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" gutterBottom>
              No hay propiedades registradas
            </Typography>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Propiedad
            </Button>
          </Box>
        ) : (
          <EntityCards
            data={filteredPropiedades.length > 0 ? filteredPropiedades : propiedades}
            cardConfig={cardConfig}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </EntityDetails>

      <EntityForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPropiedad(null);
          setFormData({
            titulo: '',
            descripcion: '',
            precio: '',
            direccion: '',
            ciudad: '',
            estado: '',
            tipo: 'CASA',
            numHabitaciones: '',
            banos: '',
            metrosCuadrados: '',
            imagen: '',
            monedaId: '',
            cuentaId: ''
          });
        }}
        onSubmit={handleFormSubmit}
        entity={formData}
        title={selectedPropiedad ? 'Editar Propiedad' : 'Nueva Propiedad'}
        fields={formFields}
        initialData={formData}
      />
    </Container>
  );
}

// También mantenemos la exportación por defecto
export default Propiedades;
