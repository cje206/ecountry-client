import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { GetTimeText, getExpire, handleKeyDownNext } from '../hooks/Functions';
import { ConfirmBtn } from './Btns';
import { toast, ToastContainer } from 'react-toastify';

export function BoardPeopleWrite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [petitionId, setPetitionId] = useState();
  const handleIsSecret = () => {
    setIsSecret(!isSecret);
  };
  const handleWrite = async () => {
    try {
      if (petitionId) {
        const res = await axios({
          method: 'PATCH',
          url: `${process.env.REACT_APP_HOST}/api/post/petition`,
          headers: {
            'Content-Type': `application/json`,
            'ngrok-skip-browser-warning': '69420',
          },
          data: {
            id: petitionId,
            title,
            content,
            isSecret,
          },
        });

        if (res.data.success) {
          toast.success('글이 등록되었습니다.', { autoClose: 1300 });
          document.location.href = `/${id}/boardPeople`;
        }
      } else {
        console.log({
          title,
          content,
          isSecret,
          countryId: id,
        });
        const res = await axios({
          method: 'POST',
          url: `${process.env.REACT_APP_HOST}/api/post/petition`,
          headers: {
            'Content-Type': `application/json`,
            'ngrok-skip-browser-warning': '69420',
            Authorization: `Bearer ${getExpire()}`,
          },
          data: {
            title,
            content,
            isSecret,
            countryId: id,
          },
        });
        console.log(res.data);
        if (res.data.success) {
          toast.success('글이 등록되었습니다.', {
            autoClose: 1200,
          });
          setTimeout(() => {
            document.location.href = `/${id}/boardPeople`;
          }, 1400);
        } else {
          toast.error('글 등록에 실패하였습니다. 다시 시도해주세요.', {
            autoClose: 1300,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getPetiton = async () => {
    const res = await axios({
      method: 'GET',
      url: `${process.env.REACT_APP_HOST}/api/post/petition/${petitionId}`,
      headers: {
        'Content-Type': `application/json`,
        'ngrok-skip-browser-warning': '69420',
      },
    });
    if (res.data.success) {
      setTitle(res.data.result.title);
      setContent(res.data.result.content);
      setIsSecret(res.data.result.isSecret);
      localStorage.removeItem('petitionId');
    }
  };
  useEffect(() => {
    if (localStorage.getItem('petitionId')) {
      setPetitionId(localStorage.getItem('petitionId'));
    }
  }, []);
  useEffect(() => {
    if (petitionId) {
      getPetiton();
    }
  }, [petitionId]);
  useEffect(() => {
    console.log(isSecret);
  }, [isSecret]);

  const contents = useRef();

  return (
    <>
      <ToastContainer />
      <div className="student-wrap">
        <div className="navi-pre-btn2" onClick={(e) => navigate(-1)}>
          <img
            src={`${process.env.PUBLIC_URL}/images/icon-back.png`}
            alt="뒤로가기"
          />
        </div>

        {/* <div style={{ color: '#666666', fontWeight: 'bolder' }}>
        신문고 글쓰기
      </div> */}

        <form className="box-style">
          <div
            className="reset"
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* 뉴스 제목 */}
            <div
              style={{
                borderBottom: '2px solid #bacd92',
                marginBottom: '20px',
              }}
            >
              <p
                align="right"
                style={{
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  color: '#666666',
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={isSecret}
                    onChange={handleIsSecret}
                  />
                  비밀글
                </label>
              </p>
              <input
                type="text"
                placeholder="제목을 입력하세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  padding: '10px',
                  border: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  color: '#666666',
                }}
                onFocus={(e) => (e.target.style.outline = 'none')}
                onBlur={(e) => (e.target.style.outline = 'none')}
                onKeyDown={(e) => handleKeyDownNext(e, contents)}
              />
            </div>
            {/* 뉴스 기사 */}
            <div
              style={{
                borderBottom: '2px solid #bacd92',
                marginBottom: '20px',
              }}
            >
              <textarea
                ref={contents}
                placeholder="제안하고자 하는 내용을 입력하세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  height: '200px',
                  padding: '10px',
                  resize: 'none',
                  border: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  color: '#666666',
                }}
                onFocus={(e) => (e.target.style.outline = 'none')}
                onBlur={(e) => (e.target.style.outline = 'none')}
              />
            </div>

            {/* 저장 버튼 */}
            <ConfirmBtn
              btnName="글 등록"
              backgroundColor="#bacd92"
              onClick={handleWrite}
            ></ConfirmBtn>
          </div>
        </form>
      </div>
    </>
  );
}
