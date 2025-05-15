import { useState, useEffect, useRef } from 'react';
import { File } from '../../api/api';
import styles from './Projects.module.css';

const Projects: React.FunctionComponent = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [files, setFiles] = useState<{ file_url: string; original_name: string; file_name: string }[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    async function getAllFiles() {
      const response = await File.getall();
      console.log(response.files);
      setFiles(response.files);
    }

    getAllFiles();
  }, [refresh]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo antes de enviar.');
      return;
    }

    try {
      setUploadStatus('Enviando...');
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await File.upload(formData);
      setFileUrl(response.url);
      setUploadStatus('Enviado');
    } catch (error) {
      setUploadStatus('Erro ao enviar o arquivo.');
    }
  };

  const toggleRefresh = () => {
    if (refresh === true) return setRefresh(false);
    return setRefresh(true);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projetos</h1>
      <label htmlFor="file-upload" className={styles.customfileUpload}>
        Escolher Arquivo
      </label>
      <input id="file-upload" type="file" onChange={handleFileChange}></input>
      {/* <input className={styles.fileInput} type="file" onChange={handleFileChange} /> */}
      <button className={styles.button} onClick={handleUpload} disabled={!selectedFile}>
        Enviar Arquivo
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}

      <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={toggleRefresh}>
        ATUALIZAR LISTA DE MODELS
      </button>
      {files && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileName}>{file.original_name}</div>
              <a className={styles.downloadLink} href={file.file_url} download={file.original_name}>
                DOWNLOAD
              </a>
              <button className={`${styles.button} ${styles.buttonSecondary}`}>Baixar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
