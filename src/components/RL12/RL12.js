import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import style from "./FormTambahRL12.module.css";
import { HiSaveAs } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/esm/Spinner";
import { useCSRFTokenContext } from '../Context/CSRFTokenContext.js'

const RL12 = () => {
  const [tahun, setTahun] = useState("");
  const [namaRS, setNamaRS] = useState("");
  const [alamatRS, setAlamatRS] = useState("");
  const [namaPropinsi, setNamaPropinsi] = useState("");
  const [namaKabKota, setNamaKabKota] = useState("");
  const [dataRL, setDataRL] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [spinner, setSpinner] = useState(false)
  const { CSRFToken } = useCSRFTokenContext()
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    const getLastYear = async () => {
      const date = new Date();
      setTahun(date.getFullYear() - 1);
      return date.getFullYear() - 1;
    };
    getLastYear().then((results) => {
      getDataRLSatuTitikDua(results);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshToken = async () => {
    try {
      const customConfig = {
          headers: {
              'XSRF-TOKEN': CSRFToken
          }
      }

      const response = await axios.get('/apisirs/token', customConfig)
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      getDataRS(decoded.rsId);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const customConfig = {
          headers: {
            'XSRF-TOKEN': CSRFToken
          }
        }

        const response = await axios.get('/apisirs/token', customConfig)

        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getDataRS = async (id) => {
    try {
      const response = await axiosJWT.get("/apisirs/rumahsakit/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //  console.log(response.data);
      setNamaRS(response.data.data[0].nama);
      setAlamatRS(response.data.data[0].alamat);
      setNamaPropinsi(response.data.data[0].propinsi.nama);
      setNamaKabKota(response.data.data[0].kabKota.nama);
    } catch (error) { }
  };

  const getDataRLSatuTitikDua = async (event) => {
    setSpinner(true)
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          tahun: event,
        },
      };
      const results = await axiosJWT.get("/apisirs/rlsatutitikdua", customConfig);

      const rlSatuTitikDuaDetails = results.data.data.map((value) => {
        return value.rl_satu_titik_dua_details;
      });

      let dataRLSatuTitikDuaDetails = [];
      rlSatuTitikDuaDetails.forEach((element) => {
        element.forEach((value) => {
          dataRLSatuTitikDuaDetails.push(value);
        });
      });
      setDataRL(dataRLSatuTitikDuaDetails);
      setSpinner(false)
    } catch (error) {
      console.log(error);
    }
  };

  const changeHandlerSingle = (event) => {
    setTahun(event.target.value);
  };

  const Cari = async (e) => {
    e.preventDefault();
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: {
          tahun: tahun,
        },
      };
      const results = await axiosJWT.get("/apisirs/rlsatutitikdua", customConfig);

      // console.log(results);

      const rlSatuTitikDuaDetails = results.data.data.map((value) => {
        return value.rl_satu_titik_dua_details;
      });

      let datarlSatuTitikDuaDetails = [];
      rlSatuTitikDuaDetails.forEach((element) => {
        element.forEach((value) => {
          datarlSatuTitikDuaDetails.push(value);
        });
      });

      setDataRL(datarlSatuTitikDuaDetails);
    } catch (error) {
      console.log(error);
    }
  };

  const hapusData = async (id) => {
    const customConfig = {
      headers: {
        'Content-Type': 'application/json',
        'XSRF-TOKEN': CSRFToken,
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axiosJWT.delete("/apisirs/rlsatutitikdua/" + id,
        customConfig
      );
      setDataRL((current) => current.filter((value) => value.id !== id));
      toast("Data Berhasil Dihapus", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.log(error);
      toast("Data Gagal Disimpan", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const hapus = (id) => {
    confirmAlert({
      title: "Konfirmasi Penghapusan",
      message: "Apakah Anda Yakin ?",
      buttons: [
        {
          label: "Ya",
          onClick: () => {
            hapusData(id);
          },
        },
        {
          label: "Tidak",
        },
      ],
    });
  };

  return (
    <div className="container" style={{ marginTop: "70px" }}>
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Profile Fasyankes</h5>
              <div
                className="form-floating"
                style={{ width: "100%", display: "inline-block" }}
              >
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  value={namaRS}
                  disabled={true}
                />
                <label htmlFor="floatingInput">Nama</label>
              </div>
              <div
                className="form-floating"
                style={{ width: "100%", display: "inline-block" }}
              >
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  value={alamatRS}
                  disabled={true}
                />
                <label htmlFor="floatingInput">Alamat</label>
              </div>
              <div
                className="form-floating"
                style={{ width: "50%", display: "inline-block" }}
              >
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  value={namaPropinsi}
                  disabled={true}
                />
                <label htmlFor="floatingInput">Provinsi </label>
              </div>
              <div
                className="form-floating"
                style={{ width: "50%", display: "inline-block" }}
              >
                <input
                  type="text"
                  className="form-control"
                  id="floatingInput"
                  value={namaKabKota}
                  disabled={true}
                />
                <label htmlFor="floatingInput">Kab/Kota</label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title h5">Periode Laporan</h5>
              <form onSubmit={Cari}>
                <div
                  className="form-floating"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <input
                    name="tahun"
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder="Tahun"
                    value={tahun}
                    onChange={(e) => changeHandlerSingle(e)}
                  />
                  <label htmlFor="floatingInput">Tahun</label>
                </div>
                <div className="mt-3 mb-3">
                  <button type="submit" className="btn btn-outline-success">
                    <HiSaveAs /> Cari
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <br></br>
      <Link
        to={`/rl12/tambah/`}
        className='btn btn-info' style={{ fontSize: "18px", backgroundColor: "#779D9E", color: "#FFFFFF" }}
      >
        {/* <AiFillFileAdd size={30} style={{ color: "gray", cursor: "pointer" }} />
        <span style={{ color: "gray" }}>RL 1.2 Indikator Pelayanan Rumah Sakit</span> */}
        +
      </Link>
      <span style={{ color: "gray" }}>RL 1.2 Indikator Pelayanan Rumah Sakit</span>
      <div className="row mt-3 mb-3">
        <div className="col-md-12">
          <table className={style.rlTable}>
            <thead>
              <tr>
                <th style={{ width: "4%" }}>Aksi</th>
                <th style={{ width: "8%" }}>BOR</th>
                <th style={{ width: "8%" }}>AlOS</th>
                <th style={{ width: "8%" }}>TOI</th>
                <th style={{ width: "8%" }}>BTO</th>
                <th style={{ width: "8%" }}>NDR</th>
                <th style={{ width: "8%" }}>GDR</th>
                <th style={{ width: "15%" }}>Rata - Rata Kunjungan</th>
              </tr>
            </thead>
            <tbody>
              {dataRL.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td>
                      <ToastContainer />
                      <div style={{ display: "flex" }}>
                      <button className="btn btn-danger" style={{ margin: "0 5px 0 0", backgroundColor: "#FF6663", border: "1px solid #FF6663" }} type='button' onClick={(e) => hapus(value.id)}>H</button>
                      <Link to={`/rl12/edit/${value.id}`} className='btn btn-warning' style={{ margin: "0 5px 0 0", backgroundColor: "#CFD35E", border: "1px solid #CFD35E", color: "#FFFFFF" }}>
                        U
                      </Link>
                      </div>

                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.bor}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.los}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.toi}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.bto}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.ndr}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.gdr}
                        disabled={true}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="no"
                        className="form-control"
                        value={value.rata_kunjungan}
                        disabled={true}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="container" style={{ textAlign: "center" }}>
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
      </div>
    </div>
  );
};

export default RL12;