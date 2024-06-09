import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import axios from 'axios';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import '../styles/setting.scss';
import styled from 'styled-components';
import { MenuContainer } from './MenuList';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Info = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 5%;
  h4 {
    margin: 0;
  }
  span {
    font-size: 0.8rem;
  }
`;

const Container = styled.div`
  @media (max-width: 1159px) {
    width: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border: 1px solid #a7d2e4;
    border-radius: 10px;
    padding: 20px;
  }

  @media (min-width: 1160px) {
    width: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
`;

export default function PcInvestment() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [list, setList] = useState([]);
  const [labels, setLabels] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [info, setInfo] = useState(null);
  const [isInfo, setIsInfo] = useState(false);

  console.log(products);
  console.log('list', list);

  const getInvest = async () => {
    const res = await axios({
      method: 'GET',
      url: `${process.env.REACT_APP_HOST}/api/invest/${id}`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    const result = res.data.result;
    setProducts(result);
    if (result.length > 0) {
      getStatus(result[0].id);
    }
  };

  const getStatus = async (investId) => {
    const res = await axios({
      method: 'GET',
      url: `${process.env.REACT_APP_HOST}/api/invest/status/${investId}`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    const result = res.data.result;
    setList(result);
    if (res.data.success) {
      setIsInfo(true);
    }

    const formattedLabels = result.map((item) => {
      const newDate = new Date(item.createdAt);
      return `${newDate.getMonth() + 1}/${newDate.getDate()}`;
    });
    setLabels(formattedLabels);

    setAmounts(result.map((item) => item.status));
  };

  useEffect(() => {
    getInvest();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const index = products.length - 1;
      getStatus(products[index].id);
      setInfo(products[index]);
      console.log('info', info);
    }
  }, [products]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'white',
        },
        ticks: {
          color: '#888888',
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        anchor: 'end',
        clamp: true,
        clip: false,
        align: '45',
        offset: -20,
        color: '#36A2EB',
        formatter: function (value) {
          return value;
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'amount',
        data: amounts,
        borderColor: '#F99417',
        borderWidth: 2,
        datalabels: {
          align: 'end',
          anchor: 'end',
          color: '#888888',
        },
      },
    ],
  };

  return (
    <>
      {isInfo ? (
        <Container>
          <div>
            <div>
              {info !== null && (
                <>
                  <Info>
                    <h4>
                      {info.name} (단위 : {info.unit})
                    </h4>
                    <span>최신 정보 : {info.info} </span>
                  </Info>
                  <div
                    style={{
                      // width: '600px',
                      // height: '400px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <Line
                      options={options}
                      data={data}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      ) : (
        <MenuContainer>
          <p style={{ color: '#333' }}>투자 정보가 없습니다.</p>
        </MenuContainer>
      )}
    </>
  );
}
