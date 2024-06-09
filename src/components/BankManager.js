import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ConfirmBtn } from './Btns';
import { ReactComponent as Arrow } from '../images/ico-arr-left.svg';
import '../styles/setting.scss';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import {
  getExpire,
  handleKeyDown,
  handleKeyDownNext,
} from '../hooks/Functions';

export function AddSavings() {
  const { id } = useParams();
  const [savingName, setSavingName] = useState('');
  const [savingDeadLine, setSavingDeadLine] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [savingList, setSavingList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(true);

  const deadLineRef = useRef(null);
  const rateRef = useRef(null);

  const getList = async () => {
    const res = await axios({
      method: 'GET',
      url: `${process.env.REACT_APP_HOST}/api/account/${id}`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    setSavingList(res.data.result);
  };
  const sendList = async () => {
    if (interestRate < 0) {
      //마이너스 이율 설정 방지
      toast.error('금리를 제대로 기입해주세요.', {
        autoClose: 1300,
      });
      return;
    }
    const res = await axios({
      method: 'POST',
      url: `${process.env.REACT_APP_HOST}/api/account`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
      data: {
        countryId: id,
        name: savingName,
        interest: interestRate,
        dueDate: savingDeadLine,
      },
    });

    if (res.data.success) {
      getList();
      toast.success('적금 상품 등록이 완료되었습니다.', { autoClose: 1300 });
      const res2 = await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_HOST}/api/student/notice/add/all/${id}`,
        headers: {
          Authorization: `Bearer ${getExpire()}`,
          'Content-Type': `application/json`,
          'ngrok-skip-browser-warning': '69420',
        },
        data: {
          content: `${savingName} 적금 상품이 신규 생성되었습니다.`,
        },
      });

      setSavingName('');
      setInterestRate('');
      setSavingDeadLine('');
      setSelectedIndex(null);
    } else {
      toast.error('적금 상품 생성에 실패했습니다. 다시 시도해주세요.', {
        autoClose: 1300,
      });
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const handleAddSavings = () => {
    if (!savingName || !savingDeadLine || !interestRate) {
      toast('모든 값을 입력해주세요');
      return;
    }

    sendList();
  };
  const selectInput = (saving, index) => {
    if (selectedIndex === index) {
      setIsAccordionOpen(false);
      setIsAddOpen(true);
      setSelectedIndex(null);
      setSavingName('');
      setInterestRate('');
      setSavingDeadLine('');
    } else {
      setSavingName(saving.name);
      setSavingDeadLine(saving.dueDate);
      setInterestRate(saving.interest);
      setSelectedIndex(index);

      setIsAccordionOpen(true);
      setIsAddOpen(false);
    }
  };

  const handleCloseAccordion = () => {
    if (selectedIndex !== null) {
      const updatedSaving = [...savingList];
      updatedSaving[selectedIndex] = {
        name: savingName,
        dueDate: savingDeadLine,
        interest: interestRate,
        dueDate: savingDeadLine,
      };
      setSavingList(updatedSaving);
    } else {
      const newSavingList = [
        ...savingList,
        {
          name: savingName,
          dueDate: savingDeadLine,
          interest: interestRate,
          dueDate: savingDeadLine,
        },
      ];
      setSavingList(newSavingList);
    }
    setSavingName('');
    setInterestRate('');
    setSavingDeadLine('');
    setSelectedIndex(null);
    setIsAccordionOpen(false); // 아코디언 닫힘 상태로 변경
    setIsAddOpen(true);
  };
  const resetBtn = () => {
    if (savingName !== '' || savingDeadLine !== '' || selectedIndex !== null) {
      const isConfirmed = window.confirm('초기화 하시겠습니까?');
      if (!isConfirmed) {
        return;
      }
      setSelectedIndex(null);
      setSavingName('');
      setInterestRate('');
      setSavingDeadLine('');
    }
  };

  const deleteBtn = async (e, accountId) => {
    if (!window.confirm('적금 상품을 삭제하시겠습니까?')) {
      return;
    }
    const res = await axios({
      method: 'PATCH',
      url: `${process.env.REACT_APP_HOST}/api/account/delete/${accountId}`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    console.log(res.data.message);
    if (res.data.success) {
      toast.success('삭제 완료되었습니다.', { autoClose: 1300 });
    }
    getList();
    setSavingName('');
    setInterestRate('');
    setSavingDeadLine('');
    setSelectedIndex(null);
  };
  const newAddBtn = () => {
    setIsAddOpen(true);
    setIsAccordionOpen(false);
    setSelectedIndex(null);
    setSavingName('');
    setInterestRate('');
    setSavingDeadLine('');
  };

  return (
    <>
      <ToastContainer />
      <div className="pc-wrap">
        <div className="setting-wrap title-wrap">
          <ul className="title-list">
            <li>적금 상품을 생성할 수 있습니다.</li>
            <li>생성 후 수정이 불가하오니 유의해주시기 바랍니다.</li>
          </ul>
        </div>

        {savingList.map((saving, index) => (
          <>
            <div
              className={`display ${
                isAccordionOpen && selectedIndex === index
                  ? 'accordion-open'
                  : ''
              } ${selectedIndex === index ? 'selected' : ''}`}
              key={index}
              onClick={() => selectInput(saving, index)}
            >
              {saving.name} (금리 {saving.interest}%)
              <Arrow stroke="#ddd" className="accArrBtn" />
            </div>
            {isAccordionOpen && selectedIndex === index && (
              <form className="box-style">
                <div className="reset">
                  <div className="set-title">적금 상품명</div>
                </div>
                <input
                  className="set-input"
                  type="text"
                  value={savingName}
                  onChange={(e) => {
                    setSavingName(e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDownNext(e, deadLineRef)}
                  disabled
                />
                <div className="set-title">적금 기간</div>
                <div className="container">
                  <input
                    ref={deadLineRef}
                    className="set-input"
                    type="number"
                    min="0"
                    value={savingDeadLine}
                    onChange={(e) => {
                      setSavingDeadLine(e.target.value);
                    }}
                    onKeyDown={(e) => handleKeyDownNext(e, rateRef)}
                    disabled
                  />
                  <div className="unit">일</div>
                </div>
                <div className="set-title">금리 설정</div>
                <div className="container">
                  <input
                    ref={rateRef}
                    className="set-input"
                    type="number"
                    min="0"
                    value={interestRate}
                    onChange={(e) => {
                      setInterestRate(e.target.value);
                    }}
                    disabled
                  />
                  <span className="unit">%</span>
                </div>
                <ConfirmBtn
                  onClick={(e) => {
                    handleCloseAccordion();
                    // updateFunc(saving.id);
                    deleteBtn(e, saving.id);
                  }}
                  btnName="삭제"
                  backgroundColor="#61759f"
                ></ConfirmBtn>
              </form>
            )}
          </>
        ))}

        {isAccordionOpen && (
          <ConfirmBtn
            onClick={() => newAddBtn()}
            btnName="상품 등록"
            // width={'80%'}
            backgroundColor="#bacd92"
          ></ConfirmBtn>
        )}

        {isAddOpen && (
          <>
            <form className="box-style">
              <div className="reset">
                <div className="set-title">적금 상품명</div>
                <img
                  className="resetBtn"
                  src={`${process.env.PUBLIC_URL}/images/icon-reset.png`}
                  onClick={resetBtn}
                  alt="초기화"
                />
              </div>
              <input
                className="set-input"
                type="text"
                value={savingName}
                onChange={(e) => {
                  setSavingName(e.target.value);
                }}
                onKeyDown={(e) => handleKeyDownNext(e, deadLineRef)}
              />
              <div className="set-title">적금 기간</div>
              <div className="container">
                <input
                  ref={deadLineRef}
                  className="set-input"
                  type="number"
                  min="0"
                  value={savingDeadLine}
                  onChange={(e) => {
                    setSavingDeadLine(e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDownNext(e, rateRef)}
                />
                <div className="unit">일</div>
              </div>
              <div className="set-title">금리 설정</div>
              <div className="container">
                <input
                  ref={rateRef}
                  className="set-input"
                  type="number"
                  min="0"
                  value={interestRate}
                  onChange={(e) => {
                    setInterestRate(e.target.value);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, handleAddSavings)}
                />
                <span className="unit">%</span>
              </div>
              <ConfirmBtn
                onClick={handleAddSavings}
                btnName="상품 등록"
                backgroundColor="#bacd92"
                width="100%"
              ></ConfirmBtn>
            </form>
          </>
        )}
      </div>
    </>
  );
}
