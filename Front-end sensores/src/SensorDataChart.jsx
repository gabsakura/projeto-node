import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const SensorDataChart = () => {
  const [sensorData, setSensorData] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  // Função para enviar os dados do sensor para o backend
  const sendSensorData = async () => {
    const dadosSensor = {
      sensor_id: 1, // Id do sensor (se necessário)
      temperatura: Math.random() * 50, // Gerando temperatura aleatória (exemplo)
      umidade: Math.random() * 100 // Gerando umidade aleatória (exemplo)
    };

    try {
      const response = await fetch('http://localhost:3000/inserir-dados-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSensor)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados do sensor: ' + response.statusText);
      }

      console.log('Dados do sensor enviados com sucesso.');
    } catch (error) {
      console.error('Erro ao enviar dados do sensor:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateChartData = async () => {
      try {
        // Enviar os dados do sensor para o backend
        await sendSensorData();

        // Buscar os dados atualizados do backend
        const response = await fetch('http://localhost:3000/dados-sensores');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados: ' + response.statusText);
        }
        const data = await response.json();
        setSensorData(data);

        // Destrói o gráfico existente antes de criar um novo
        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = document.getElementById('sensor-chart');
        const newChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            // labels: data.map(entry => new Date(entry.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })),
            labels: data.map(entry => {
              const timestamp = new Date(entry.timestamp);
              timestamp.setHours(timestamp.getHours() - 3); // Subtraindo 3 horas
              return timestamp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          }),
            datasets: [
              {
                label: 'Temperatura',
                data: data.map(entry => entry.temperatura),
                borderColor: 'rgb(227 15 89)',
              },
              {
                label: 'Umidade',
                data: data.map(entry => entry.umidade),
                borderColor: 'rgb(54, 162, 235)',
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

        // Armazena a nova instância do gráfico no estado
        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Erro ao buscar ou atualizar dados:', error);
      }
    };

    const interval = setInterval(updateChartData, 10000); // Intervalo de 10 segundos

    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, [chartInstance]);

  return <canvas id="sensor-chart" width="600" height="200"></canvas>;
};

export default SensorDataChart;