import React, { useState, useEffect ,useRef} from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { HiSaveAs } from 'react-icons/hi'
import 'react-toastify/dist/ReactToastify.css'
import 'react-confirm-alert/src/react-confirm-alert.css'
import style from './absensi.module.css'
// import Table from 'react-bootstrap/Table'

import { DownloadTableExcel } from "react-export-table-to-excel"
import { useCSRFTokenContext } from '../Context/CSRFTokenContext.js'



const Absensi = () => {
    const [namaRS, setNamaRS] = useState('')
    const [daftarProvinsi, setDaftarProvinsi] = useState([])
    const [daftarKabKota, setDaftarKabKota] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const [provinsiId, setProvinsiId] = useState(null)
    const [kabKotaId, setKabKotaId] = useState(null)
    const [dataAbsensi, setDataAbsensi] = useState([])
    const [namafile, setNamaFile] = useState("");
    const tableRef = useRef(null);
    const [apa,setApa]=useState(true)
    const { CSRFToken } = useCSRFTokenContext()
    
    const navigate = useNavigate()

    useEffect(() => {
        refreshToken()
        getProvinsi()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const refreshToken = async() => {
        try {
            const customConfig = {
                headers: {
                    'XSRF-TOKEN': CSRFToken
                }
            }
    
            const response = await axios.get('/apisirs/token', customConfig)
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
            // getDataRS(decoded.rsId)
        } catch (error) {
            if(error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async(config) => {
        const currentDate = new Date()
        if (expire * 1000 < currentDate.getTime()) {
            const customConfig = {
                headers: {
                    'XSRF-TOKEN': CSRFToken
                }
            }
    
            const response = await axios.get('/apisirs/token', customConfig)
            config.headers.Authorization = `Bearer ${response.data.accessToken}`
            setToken(response.data.accessToken)
            const decoded = jwt_decode(response.data.accessToken)
            setExpire(decoded.exp)
        }
        return config
    }, (error) => {
        return Promise.reject(error)
    })

    const getProvinsi = async () => {
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
            const results = await axiosJWT.get('/apisirs/provinsibaru',
                customConfig)

            const daftarProvinsi = results.data.data.map((value) => {
                return value
            })

            setDaftarProvinsi(daftarProvinsi)
        } catch (error) {
            console.log(error)
        }
    }

    const getKabKota = async (provinsiId) => {
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    provinsiId: provinsiId
                }
            }
            const results = await axiosJWT.get('/apisirs/kabkotabaru',
                customConfig)
                console.log(results.data.data)
            const daftarKabKota = results.data.data.map((value) => {
                return value
            })

            setDaftarKabKota(daftarKabKota)
        } catch (error) {
            console.log(error)
        }
    }

    const provinsiChangeHandler = (e) => {
        const provinsiId = e.target.value
        console.log(e.target)
        setProvinsiId(provinsiId)
        getKabKota(provinsiId)
    }

    const kabKotaChangeHandler = (e) => {
        const kabKotaId = e.target.value
        setKabKotaId(kabKotaId)
    }

    const changeHandlerNamaRs = (event) => {
        setNamaRS(event.target.value)
    }

    const Cari = async (e) => {
        e.preventDefault()
        const parameterAbsensi = {};

        if (provinsiId != null) {
            parameterAbsensi.provinsiId = provinsiId
        }

        if (kabKotaId !== null && kabKotaId !== '0') {
            parameterAbsensi.kabKotaId = kabKotaId
        }

        if (namaRS !== '') {
            parameterAbsensi.namaRS = namaRS
        }

        console.log(parameterAbsensi)

        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: parameterAbsensi
            }
            const results = await axiosJWT.get('/apisirs/absensi',
                customConfig)
            const dataAbsensiDetail = results.data.data.map((value) => {
                return value
            })
            setDataAbsensi(dataAbsensiDetail)
            setNamaFile("Absensi_".concat(String(provinsiId).concat("-").concat(kabKotaId).concat("-").concat(namaRS)));

            console.log(daftarKabKota)
            setApa(false);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="container" style={{ marginTop: "70px" , marginBottom: "70px" }}>
            <form onSubmit={Cari}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-floating" style={{ width: "100%", paddingBottom: "5px" }}>
                                    <select
                                        name="provinsi"
                                        id="provinsi"
                                        typeof="select"
                                        className="form-select"
                                        onChange={e => provinsiChangeHandler(e)}
                                    >
                                        <option key={0} value={0}>Pilih</option>
                                        <option key={999} value={999}>ALL</option>
                                        {daftarProvinsi.map((nilai) => {
                                            return (
                                                <option
                                                    key={nilai.id}
                                                    value={nilai.id}
                                                >
                                                    {nilai.nama}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <label htmlFor="provinsi">Provinsi</label>
                                </div>

                                <div className="form-floating" style={{ width: "100%", paddingBottom: "5px" }}>
                                    <select
                                        name="kabKota"
                                        id="kabKota"
                                        typeof="select"
                                        className="form-select"
                                        onChange={e => kabKotaChangeHandler(e)}
                                    >
                                        <option key={0} value={0}>Pilih</option>
                                        {daftarKabKota.map((nilai) => {
                                            return (
                                                <option
                                                    key={nilai.id}
                                                    value={nilai.id}
                                                >
                                                    {nilai.nama}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <label htmlFor="kabKota">Kab/Kota</label>
                                </div>

                                <div className="form-floating" style={{ width: "100%", paddingBottom: "5px" }}>
                                    <input type="text" name="namaRS" className="form-control"
                                        value={namaRS} onChange={e => changeHandlerNamaRs(e)} disabled={false} />
                                    <label htmlFor="namaRS">Nama RS</label>
                                </div>

                                <div className="mt-1">
                                    <button type="submit" className="btn btn-outline-success" ><HiSaveAs /> Cari</button>
                            <DownloadTableExcel
                            filename={namafile}
                            sheet="Absensi"
                            currentTableRef={tableRef.current}
                        >
                            {/* <button> Export excel </button> */}
                            <button className='btn' style={{ fontSize: "18px", marginLeft: "5px", backgroundColor: "#779D9E", color: "#FFFFFF" }} hidden={apa}> Download
                            </button>
                        </DownloadTableExcel>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div className="row mt-3">
                <div className="col-md-12">
                    <div className={`${style['table-container']} mt-2 mb-1 pb-2 `}>
                        <table
                        className={style.table}
                        ref={tableRef}>
                            <thead className={style.thead}>
                                <tr className="main-header-row">
                                    <th className={style['sticky-header']} rowSpan="2" style={{ "width": "60px" }} >No.</th>
                                    <th className={style['sticky-header']} rowSpan="2" style={{ "width": "100px" }}>Kode RS</th>
                                    <th className={style['sticky-header']} rowSpan="2" style={{ "width": "300px" }}>Nama RS</th>
                                    {/* <th rowSpan="2" className={style.myTableTH} style={{ "width": "1%" }}>RL 3.2</th> */}
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 1.2</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 1.3</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.1</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.2</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.3</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.4</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.5</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.6</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.7</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.8</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.9</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.10</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.11</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.12</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.13a</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.13b</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.14</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 3.15</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 4a</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 4a Sebab</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 4b</th>
                                    <th rowSpan="2" className={style.myTableTH} style={{ "width": "1.5%" }}>RL 4b Sebab</th>

                                    
                                    <th colSpan="12" >RL 5.1</th>
                                    <th colSpan="12" >RL 5.2</th>
                                    <th colSpan="12" >RL 5.3</th>
                                    <th colSpan="12" >RL 5.4</th>
                                    {/* <th colSpan="0" className={style.myTableTH} >Action</th> */}
                                    {/* <th colSpan="12" className={style.myTableTH} >RL 5.4</th> */}
                                </tr>
                                <tr className={style['subheader-row']}>
                                   

                                <th style={{ "width": "200px" }} >1</th>
                                    <th style={{ "width": "50px" }} >2</th>
                                    <th style={{ "width": "50px" }}>3</th>
                                    <th style={{ "width": "50px" }}>4</th>
                                    <th style={{ "width": "50px" }}>5</th>
                                    <th style={{ "width": "50px" }}>6</th>
                                    <th style={{ "width": "50px" }}>7</th>
                                    <th style={{ "width": "50px" }}>8</th>
                                    <th style={{ "width": "50px" }}>9</th>
                                    <th style={{ "width": "50px" }}>10</th>
                                    <th style={{ "width": "50px" }}>11</th>
                                    <th style={{ "width": "50px" }}>12</th>

                                    <th className={style.myTableTH} style={{ "width": "1%" }}>1</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>2</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>3</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>4</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>5</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>6</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>7</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>8</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>9</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>10</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>11</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>12</th>

                                    <th className={style.myTableTH} style={{ "width": "1%" }}>1</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>2</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>3</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>4</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>5</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>6</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>7</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>8</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>9</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>10</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>11</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>12</th>

                                    <th className={style.myTableTH} style={{ "width": "1%" }}>1</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>2</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>3</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>4</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>5</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>6</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>7</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>8</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>9</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>10</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>11</th>
                                    <th className={style.myTableTH} style={{ "width": "1%" }}>12</th>

                                </tr>
                            </thead>
                            <tbody>
                                {dataAbsensi.map((value, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className={style['sticky-column']} style={{ textAlign: 'right', verticalAlign: 'middle' }}>{index + 1}</td>
                                            <td className={style['sticky-column']}>{value.rs_id}</td>
                                            <td className={style['sticky-column']}>{value.nama_rs}</td>
                                            

                                            {/* 1.2 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_12 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            {/* 1.3 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_13 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            {/* 3.1 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_31 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                          <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                          {/* <label class="btn btn-outline-success" for="success-outlined">V</label> */}
                                                        </div>
                                                    )
                                                }
                                            </td>
                                           

                                            {/* 3.2 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_32 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.3 */}

                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_33 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.4 */}

                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_34 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                           

                                            {/* 3.5 */}

                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_35 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.6 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_36 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.7 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_37 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.8 */}

                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_38 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                           

                                            {/* 3.9 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_39 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.10 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_310 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            


                                            {/* 3.11 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_311 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                            {/* 3.12 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_312 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                           

                                            {/* 3.13a */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_313a === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                              {/* 3.13b */}
                                              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_313b === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                            {/* 3.14 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_314 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 3.15 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_315 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                            

                                            {/* 4a */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_4a === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            {/* 4a sebab */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_4as === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 4b */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_4b === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            {/* 4b sebab */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_4bs === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            

                                            {/* 5.1 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_1 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_2 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_3 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_4 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_5 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_6 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_7 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_8 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_9 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_10 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_11 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_51_bulan_12 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                            {/* 5.2 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_1 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_2 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_3 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_4 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_5 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_6 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_7 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_8 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_9 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_10 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_11 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_52_bulan_12 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>

                                            {/* 5.3 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_1 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_2 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_3 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_4 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_5 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_6 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_7 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_8 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_9 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_10 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_11 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_53_bulan_12 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            
                                            {/* 5.4 */}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_1 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_2 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_3 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_4 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_5 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_6 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_7 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_8 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_9 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_10 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_11 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                {
                                                    value.rl_54_bulan_12 === 0 ? (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#FF0000' }}>X</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p class="text fw-bold" style={{color:'#32CD32' }}>V</p>
                                                        </div>
                                                    )
                                                }
                                            </td>                                        
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    )


}

export default Absensi