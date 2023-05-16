import React, { useContext, useEffect, useRef, useState } from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { LinkContex } from '../contex/LinkContex';
import { sectionApi } from '../config/apis';
import toast from 'react-hot-toast';

function Section({ section, sectionInfo, permission }) {

    let { dispatchLink } = useContext(LinkContex);
    let navigate = useNavigate();

    let [desc, setdesc] = useState("");
    let [title, settitle] = useState("");
    let [tid, setid] = useState(null);

    let updateSectionDb = async (ddata) => {

        let res = await fetch(sectionApi + section, {
            method: "PUT",
            headers: {
                'authorization': localStorage.getItem('noteAuth'),
                'Content-Type': "application/json"
            },
            body: JSON.stringify(ddata)
        });

        let data = await res.json();

        if (!data.success) {
            toast.error("something went wrong", {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            })
        }
    }
    let updatesection = async () => {
        if (!permission) return;
        let newsection = {
            title: title,
            desc: desc
        }

        // debouncing
        dispatchLink({ type: "UP_LINK", key: sectionInfo._id, payload: newsection });

        clearTimeout(tid);
        let some = setTimeout(() => updateSectionDb(newsection), 1500);
        setid(some);
    }

    useEffect(() => {
        if (title && desc && ((title != sectionInfo?.title) || (desc != sectionInfo?.desc))) {
            updatesection();
        }
    }, [title, desc])


    let delelesection = async () => {
        if (!permission) return;
        let ok = confirm("are u sure want to delete section?");
        if (ok) {
            let tid = toast.loading("deleting");
            let res = await fetch(sectionApi + section, {
                method: "DELETE",
                headers: {
                    'authorization': localStorage.getItem('noteAuth')
                }
            })
            let data = await res.json();

            if (data.success) {
                dispatchLink({ type: "DLT_LINK", key: data.msg });
                navigate("/");
                toast.success("section deleted", {
                    id: tid,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                })
            }
        }
    }

    useEffect(() => {
        if (sectionInfo) {
            settitle(sectionInfo.title);
            setdesc(sectionInfo.desc);
        }
    }, [sectionInfo])

    return (
        <>
            {
                sectionInfo ? <div className="section">
                    <div className="title" >

                        <input disabled={permission ? false : true} value={title || ''} onChange={(e) => {
                            settitle(e.target.value)
                        }} className='f_title' type="text" />
                        {
                            permission ?
                                <div className="dlt_section" onClick={delelesection}>
                                    <DeleteForeverIcon style={{ cursor: "pointer", color: "red" }} />
                                </div> : null
                        }
                    </div>
                    <div className="date">
                        {sectionInfo?.updatedAt?.toString()?.substr(0, 10)}
                    </div>
                    <TextareaAutosize disabled={permission ? false : true} value={desc || ''} onChange={(e) => setdesc(e.target.value)}
                        maxRows={6} style={{ fontSize: "1.1rem", background: "transparent", maxWidth: "600px" }} />

                </div> : null
            }
        </>

    )
}

export default Section
