import { useState, useEffect } from 'react';
import clienteAxios from '../../../config/axios';

export const useRelationalData = ({
  open,
  formType,
  relatedFields = []
}) => {
  const [relatedData, setRelatedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!open || !formType || !relatedFields.length) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Obtenemos la configuración del formulario del FormController
        const configResponse = await clienteAxios.get(`/forms/${formType}/config`);
        const config = configResponse.data;

        // Cargamos los datos relacionados para cada campo
        const relatedDataPromises = relatedFields.map(async field => {
          const fieldConfig = config.fields.find(f => f.name === field.name);
          if (!fieldConfig?.endpoint) return null;

          const response = await clienteAxios.get(fieldConfig.endpoint);
          return {
            field: field.name,
            data: response.data.docs || []
          };
        });

        const results = await Promise.all(relatedDataPromises);
        
        if (isMounted) {
          const newRelatedData = results.reduce((acc, result) => {
            if (result) {
              acc[result.field] = result.data;
            }
            return acc;
          }, {});
          
          setRelatedData(newRelatedData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar datos relacionados:', error);
          setError(error.message || 'Error al cargar datos relacionados');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [open, formType, relatedFields]);

  const refreshField = async (fieldName) => {
    if (!formType || !fieldName) return;

    setIsLoading(true);
    setError(null);

    try {
      const configResponse = await clienteAxios.get(`/forms/${formType}/config`);
      const config = configResponse.data;
      
      const fieldConfig = config.fields.find(f => f.name === fieldName);
      if (!fieldConfig?.endpoint) return;

      const response = await clienteAxios.get(fieldConfig.endpoint);
      
      setRelatedData(prev => ({
        ...prev,
        [fieldName]: response.data.docs || []
      }));
    } catch (error) {
      setError(error.message || `Error al actualizar ${fieldName}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    relatedData,
    isLoading,
    error,
    refreshField
  };
}; 