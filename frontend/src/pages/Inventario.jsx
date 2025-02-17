import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Button, 
  Box, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import EntityToolbar from '../components/EntityToolbar';
import EntityDetails from '../components/EntityViews/EntityDetails';
import EntityForm from '../components/EntityViews/EntityForm';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { 
  ApartmentOutlined as BuildingIcon,
  BedOutlined as BedIcon,
  PeopleOutlined as PeopleIcon,
  DescriptionOutlined as DescriptionIcon
} from '@mui/icons-material';

export function Inventario() {
  const [items, setItems] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    Promise.all([
      fetchInventario(),
      fetchPropiedades()
    ]);
  }, []);

  const fetchInventario = async () => {
    try {
      const response = await axios.get('/api/inventario');
      setItems(response.data);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      enqueueSnackbar('Error al cargar inventario', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropiedades = async () => {
    try {
      const response = await axios.get('/api/propiedades');
      setPropiedades(response.data);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const response = await axios.post('/api/inventario', formData);
      if (response.status === 201) {
        enqueueSnackbar('Item agregado exitosamente', { variant: 'success' });
        setIsFormOpen(false);
        fetchInventario();
      }
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(error.response?.data?.error || 'Error al crear item', { variant: 'error' });
    }
  };

  const formFields = [
    {
      name: 'nombre',
      label: 'Nombre del Item',
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      multiline: true,
      rows: 3
    },
    {
      name: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      required: true
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'NUEVO', label: 'Nuevo' },
        { value: 'USADO', label: 'Usado' },
        { value: 'REPARACION', label: 'En Reparación' }
      ]
    }
  ];

  const hasPropiedades = propiedades.length > 0;

  return (
    <Container maxWidth="lg">
      <EntityToolbar
        onAdd={() => setIsFormOpen(true)}
        searchPlaceholder="Buscar items..."
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
            icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
            label: 'Contratos',
            to: '/contratos'
          }
        ]}
        disableNavigation={!hasPropiedades}
      />

      <EntityDetails
        title="Inventario"
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="small"
            onClick={() => setIsFormOpen(true)}
          >
            Nuevo Item
          </Button>
        }
      >
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="h6" gutterBottom>
              No hay items en el inventario
            </Typography>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFormOpen(true)}
              sx={{ mt: 2 }}
            >
              Agregar Item
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell align="right">{item.cantidad}</TableCell>
                    <TableCell>{item.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </EntityDetails>

      <EntityForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        title="Nuevo Item"
        fields={formFields}
      />
    </Container>
  );
}

export default Inventario;
