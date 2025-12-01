// app/components/IzinChart.js
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Daftarkan komponen-komponen Chart.js yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function IzinChart({ chartData }) {
  // Format data dari API agar sesuai dengan format yang dibutuhkan Chart.js
  const data = {
    labels: chartData.map(d => new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Jumlah Siswa Izin',
        data: chartData.map(d => d.jumlah_izin),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Perkembangan Izin Siswa (30 Hari Terakhir)',
      },
    },
  };

  return <Line options={options} data={data} />;
}