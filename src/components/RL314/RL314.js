import React, { useState, useEffect } from 'react'
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import style from './FormTambahRL314.module.css'
import { HiSaveAs } from 'react-icons/hi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import { Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useCSRFTokenContext } from '../Context/CSRFTokenContext.js'

const RL314 = () => {
    const [tahun, setTahun] = useState('')
    const [namaRS, setNamaRS] = useState('')
    const [alamatRS, setAlamatRS] = useState('')
    const [namaPropinsi, setNamaPropinsi] = useState('')
    const [namaKabKota, setNamaKabKota] = useState('')
    const [dataRL, setDataRL] = useState([])
    const [token, setToken] = useState('')
    const [expire, setExpire] = useState('')
    const navigate = useNavigate()
    const [spinner, setSpinner] = useState(false)
    const { CSRFToken } = useCSRFTokenContext()

    useEffect(() => {
        refreshToken()
        const getLastYear = async () => {
            const date = new Date()
            setTahun(date.getFullYear() - 1)
            return date.getFullYear() - 1
        }
        getLastYear().then((results) => {
            getDataRLTigaTitikEmpatBelas(results)
        })
        // getRLTigaTitikEmpatBelasTemplate()
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [])

    const refreshToken = async () => {
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
            getDataRS(decoded.rsId)
        } catch (error) {
            if (error.response) {
                navigate('/')
            }
        }
    }

    const axiosJWT = axios.create()
    axiosJWT.interceptors.request.use(async (config) => {
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

    const getDataRS = async (id) => {
        try {
            const response = await axiosJWT.get('/apisirs/rumahsakit/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            // console.log(response.data)
            setNamaRS(response.data.data[0].nama)
            setAlamatRS(response.data.data[0].alamat)
            setNamaPropinsi(response.data.data[0].propinsi.nama)
            setNamaKabKota(response.data.data[0].kabKota.nama)
        } catch (error) {

        }
    }

    const getDataRLTigaTitikEmpatBelas = async (event) => {
        setSpinner(true)
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    tahun: event
                }
            }
            const results = await axiosJWT.get('/apisirs/rltigatitikempatbelas',
                customConfig)

            const rlTigaTitikEmpatBelasDetails = results.data.data.map((value) => {
                return value.rl_tiga_titik_empat_belas_details
            })

            let dataRLTigaTitikEmpatBelasDetails = []
            rlTigaTitikEmpatBelasDetails.forEach(element => {
                element.forEach(value => {
                    dataRLTigaTitikEmpatBelasDetails.push(value)
                })
            })
            setDataRL(dataRLTigaTitikEmpatBelasDetails)
            setSpinner(false)
        } catch (error) {
            console.log(error)
        }
    }

    const getRLTigaTitikEmpatBelasTemplate = async () => {
        try {
            const response = await axiosJWT.get('/jenisspesialis?rlid=15', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const rlTemplate = response.data.data.map((value, index) => {
                return {
                    id: value.no,
                    jenisSpesialis: value.nama,
                    rujukanDiterimaDariPuskesmas: 0,
                    rujukanDiterimaDariFasilitasKesehatanLain: 0,
                    rujukanDiterimaDariRsLain: 0,
                    rujukanDikembalikanKePuskesmas: 0,
                    rujukanDikembalikanKeFasilitasKesehatanLain: 0,
                    rujukanDikembalikanKeRsAsal: 0,
                    dirujukanPasienRujukan: 0,
                    dirujukPasienDatangSendiri: 0,
                    dirujukDiterimaKembali: 0,
                    disabledInput: true,
                    checked: false
                }
            })
            setDataRL(rlTemplate)
        } catch (error) {

        }
    }

    const changeHandlerSingle = (event) => {
        setTahun(event.target.value)
    }

    const changeHandler = (event, index) => {
        let newDataRL = [...dataRL]
        const name = event.target.name
        if (name === 'check') {
            if (event.target.checked === true) {
                newDataRL[index].disabledInput = false
            } else if (event.target.checked === false) {
                newDataRL[index].disabledInput = true
            }
            newDataRL[index].checked = event.target.checked

        } else if (name === 'no') {
            newDataRL[index].no = event.target.value
        } else if (name === 'jenisSpesialis') {
            newDataRL[index].jenisSpesialis = event.target.value
        } else if (name === 'rujukan_diterima_dari_puskesmas') {
            newDataRL[index].rujukanDiterimaDariPuskesmas = event.target.value
        } else if (name === 'rujukan_diterima_dari_fasilitas_kesehatan_lain') {
            newDataRL[index].rujukanDiterimaDariFasilitasKesehatanLain = event.target.value
        } else if (name === 'rujukan_diterima_dari_rs_lain') {
            newDataRL[index].rujukanDiterimaDariRsLain = event.target.value
        } else if (name === 'rujukan_dikembalikan_ke_puskesmas') {
            newDataRL[index].rujukanDikembalikanKePuskesmas = event.target.value
        } else if (name === 'rujukan_dikembalikan_ke_fasilitas_kesehatan_lain') {
            newDataRL[index].rujukanDikembalikanKeFasilitasKesehatanLain = event.target.value
        } else if (name === 'rujukan_dikembalikan_ke_rs_asal') {
            newDataRL[index].rujukanDikembalikanKeRsAsal = event.target.value
        } else if (name === 'dirujukan_pasien_rujukan') {
            newDataRL[index].dirujukanPasienRujukan = event.target.value
        } else if (name === 'dirujuk_pasien_datang_sendiri') {
            newDataRL[index].dirujukPasienDatangSendiri = event.target.value
        } else if (name === 'dirujuk_diterima_kembali') {
            newDataRL[index].dirujukDiterimaKembali = event.target.value
        }
        setDataRL(newDataRL)
    }

    const Cari = async (e) => {
        e.preventDefault()
        try {
            const customConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    tahun: tahun
                }
            }
            const results = await axiosJWT.get('/apisirs/rltigatitikempatbelas',
                customConfig)

            console.log(results)

            const rlTigaTitikEmpatBelasDetails = results.data.data.map((value) => {
                return value.rl_tiga_titik_empat_belas_details
            })

            let dataRLTigaTitikEmpatBelasDetails = []
            rlTigaTitikEmpatBelasDetails.forEach(element => {
                element.forEach(value => {
                    dataRLTigaTitikEmpatBelasDetails.push(value)
                })
            })

            setDataRL(dataRLTigaTitikEmpatBelasDetails)
            // console.log(dataRLTigaTitikEmpatBelasDetails)
            // console.log(dataRL)
        } catch (error) {
            console.log(error)
        }
    }

    const hapusData = async (id) => {
        const customConfig = {
            headers: {
                'Content-Type': 'application/json',
                'XSRF-TOKEN': CSRFToken,
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            await axiosJWT.delete(`/apisirs/rltigatitikempatbelasdetail/${id}`,
                customConfig)
            setDataRL((current) =>
                current.filter((value) => value.id !== id)
            )
            toast('Data Berhasil Dihapus', {
                position: toast.POSITION.TOP_RIGHT
            })
        } catch (error) {
            console.log(error)
            toast('Data Gagal Disimpan', {
                position: toast.POSITION.TOP_RIGHT
            })
        }
    }

    const hapus = (id) => {
        confirmAlert({
            title: 'Konfirmasi Penghapusan',
            message: 'Apakah Anda Yakin ?',
            buttons: [
                {
                    label: 'Ya',
                    onClick: () => {
                        hapusData(id)
                    }
                },
                {
                    label: 'Tidak'
                }
            ]
        })
    }

    return (
        <div className="container" style={{ marginTop: "70px" }}>
            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title h5">Profile Fasyankes</h5>
                            <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                <input type="text" className="form-control" id="floatingInput"
                                    value={namaRS} disabled={true} />
                                <label htmlFor="floatingInput">Nama</label>
                            </div>
                            <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                <input type="text" className="form-control" id="floatingInput"
                                    value={alamatRS} disabled={true} />
                                <label htmlFor="floatingInput">Alamat</label>
                            </div>
                            <div className="form-floating" style={{ width: "50%", display: "inline-block" }}>
                                <input type="text" className="form-control" id="floatingInput"
                                    value={namaPropinsi} disabled={true} />
                                <label htmlFor="floatingInput">Provinsi </label>
                            </div>
                            <div className="form-floating" style={{ width: "50%", display: "inline-block" }}>
                                <input type="text" className="form-control" id="floatingInput"
                                    value={namaKabKota} disabled={true} />
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
                                <div className="form-floating" style={{ width: "100%", display: "inline-block" }}>
                                    <input name="tahun" type="text" className="form-control" id="floatingInput"
                                        placeholder="Tahun" value={tahun} onChange={e => changeHandlerSingle(e)} />
                                    <label htmlFor="floatingInput">Tahun</label>
                                </div>
                                <div className="mt-3 mb-3">
                                    <button type="submit" className="btn btn-outline-success"><HiSaveAs /> Cari</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <br></br>
            {/* <Link to={`/rl314/tambah/`} style={{textDecoration: "none"}}>
                    <AiFillFileAdd size={30} style={{color:"gray",cursor: "pointer"}}/><span style={{color: "gray"}}>RL 3.14 Rujukan</span>
                </Link> */}
            <div className="row mt-3 mb-3">
                <div className="col-md-12">
                    <Link to={`/rl314/tambah/`} className='btn btn-info' style={{ fontSize: "18px", backgroundColor: "#779D9E", color: "#FFFFFF" }}>
                        {/* <AiFillFileAdd size={30} style={{color:"gray",cursor: "pointer"}}/>
                                <span style={{color: "gray"}}>Tambah RL 3.1 Rawat Inap</span> */}
                        +
                    </Link>
                    <span style={{ color: "gray" }}>RL. 3.14 Rujukan</span>
                    <div className="container" style={{ textAlign: "center" }}>
                        {/* {spinner && <Spinner animation="border" variant="secondary"></Spinner>} */}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                        {spinner && <Spinner animation="grow" variant="success"></Spinner>}
                    </div>
                    <table className={style.rlTable}>
                        <thead>
                            <tr>
                                <th style={{ "width": "%" }}>No Kegiatan</th>
                                <th style={{ "width": "6%" }}>Aksi</th>
                                <th style={{ "width": "20%" }}>Jenis Spesialisasi</th>
                                <th>Rujukan Diterima Dari Puskesmas</th>
                                <th>Rujukan Diterima Dari Fasilitas Kesehatan Lain</th>
                                <th>Rujukan Diterima Dari RUmah Sakit Lain</th>
                                <th>Rujukan Dikembalikan Ke Puskesmas</th>
                                <th>Rujukan Dikembalikan Ke Fasilitas Kesehatan Lain</th>
                                <th>Rujukan Dikembalikan Ke Rumah Sakit Asal</th>
                                <th>Dirujuk Pasien Rujukan</th>
                                <th>Dirujuk Pasien Datang Sendiri</th>
                                <th>Dirujuk Diterima Kembali</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataRL.map((value, index) => {
                                return (
                                    <tr key={value.id}>
                                        {/* {console.log(value)} */}
                                        {/* <td>
                                                <input type='text' name='id' className="form-control" value={index + 1} disabled={true}/>
                                            </td> */}
                                        <td>
                                            <input type="text" name="no" className="form-control" value={value.jenis_spesialisasi.no} disabled={true} />
                                        </td>
                                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                            <ToastContainer />
                                            {/* <RiDeleteBin5Fill  size={20} onClick={(e) => hapus(value.id)} style={{color: "gray", cursor: "pointer", marginRight: "5px"}} />
                                                <Link to={`/rl314/ubah/${value.id}`}>
                                                    <RiEdit2Fill size={20} style={{color:"gray",cursor: "pointer"}}/>
                                                </Link> */}
                                            <div style={{ display: "flex" }}>
                                                <button className="btn btn-danger" style={{ margin: "0 5px 0 0", backgroundColor: "#FF6663", border: "1px solid #FF6663" }} type='button' onClick={(e) => hapus(value.id)}>H</button>
                                                <Link to={`/rl314/ubah/${value.id}`} className='btn btn-warning' style={{ margin: "0 5px 0 0", backgroundColor: "#CFD35E", border: "1px solid #CFD35E", color: "#FFFFFF" }} >
                                                    U
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            <input type="text" name="jenis_spesialis" className="form-control" value={value.jenis_spesialisasi.nama} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_diterima_dari_puskesmas" className="form-control" value={value.rujukan_diterima_dari_puskesmas}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_diterima_dari_fasilitas_kesehatan_lain" className="form-control" value={value.rujukan_diterima_dari_fasilitas_kesehatan_lain}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_diterima_dari_rs_lain" className="form-control" value={value.rujukan_diterima_dari_rs_lain}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_dikembalikan_ke_puskesmas" className="form-control" value={value.rujukan_dikembalikan_ke_puskesmas}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_dikembalikan_ke_fasilitas_kesehatan_lain" className="form-control" value={value.rujukan_dikembalikan_ke_fasilitas_kesehatan_lain}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="rujukan_dikembalikan_ke_rs_asal" className="form-control" value={value.rujukan_dikembalikan_ke_rs_asal}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="dirujukan_pasien_rujukan" className="form-control" value={value.dirujukan_pasien_rujukan}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="dirujuk_pasien_datang_sendiri" className="form-control" value={value.dirujuk_pasien_datang_sendiri}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>
                                        <td>
                                            <input type="text" name="dirujuk_diterima_kembali" className="form-control" value={value.dirujuk_diterima_kembali}
                                                onChange={e => changeHandler(e, index)} disabled={true} />
                                        </td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RL314