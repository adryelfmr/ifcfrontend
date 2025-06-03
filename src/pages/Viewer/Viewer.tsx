import { useState, useEffect, useRef } from 'react';
import { File } from '../../api/api';
import styles from './Viewer.module.css';
import * as THREE from 'three';
import * as OBCF from '@thatopen/components-front';
import * as OBC from '@thatopen/components';

const Viewer: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [files, setFiles] = useState<{ file_url: string; original_name: string; file_name: string }[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [world, setWorld] = useState<any>();
  const [model, setModel] = useState<any>();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const dimensions = components.get(OBCF.LengthMeasurement);
  const volumeMeasurements = components.get(OBCF.VolumeMeasurement);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);
  const grids = components.get(OBC.Grids);
  const highlighter = components.get(OBCF.Highlighter);
  const outliner = components.get(OBCF.Outliner);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  
  useEffect(() => {
    async function worldRenderer() {
      if (containerRef.current) {
        // if (world) {

        // }
        const newWorld = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBCF.PostproductionRenderer>();

        newWorld.scene = new OBC.SimpleScene(components);
        newWorld.renderer = new OBCF.PostproductionRenderer(components, containerRef.current);
        newWorld.camera = new OBC.SimpleCamera(components);

        components.init();

        newWorld.scene.three.background = null;
        newWorld.scene.setup();
        // newWorld.scene.config.backgroundColor = new THREE.Color(0xff0000);
        newWorld.scene.config.directionalLight.intensity = 10;
        newWorld.scene.config.ambientLight.intensity = 10;
        newWorld.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        const grid = grids.create(newWorld);
        grid.config.color = new THREE.Color(0xffffff);
        grid.config.primarySize = 10;
        grid.config.secondarySize = 40;
        grid.config.visible = true;

        const { postproduction } = newWorld.renderer;
        postproduction.enabled = true;
        postproduction.customEffects.excludedMeshes.push(grid.three);
        const ao = postproduction.n8ao.configuration;
        setWorld(newWorld);
        console.log(newWorld);
      }
    }
    worldRenderer();
  }, []);

  const ifcLoader = async (file: string) => {
    try {
      // Primeiro, configure o mundo para o outliner
      outliner.world = world;
      outliner.enabled = true;
  
      // Agora é seguro limpar o outliner
      outliner.clear(file);
      
      await fragmentIfcLoader.setup();
      const response = await fetch(file);
      const data = await response.arrayBuffer();
      const buffer = new Uint8Array(data);
      
      const newModel = await fragmentIfcLoader.load(buffer);
      newModel.name = file;
  
      // Remove o modelo anterior, se existir
      if (model && world) {
        world.scene.three.remove(model);
      }
  
      setModel(newModel);
      world.scene.three.add(newModel);
      
      // Configurar outras ferramentas de visualização
      dimensions.world = world;
      dimensions.enabled = true;
      dimensions.snapDistance = 1;
      
      volumeMeasurements.world = world;
      volumeMeasurements.enabled = true;
  
      highlighter.setup({ world });
      highlighter.zoomToSelection = true;
  
      // Criar o outliner com um nome único para evitar conflitos
      const uniqueName = file + "_" + Date.now();
      outliner.create(
        uniqueName,
        new THREE.MeshBasicMaterial({
          color: 0xbcf124,
          transparent: true,
          opacity: 0.5,
        }),
      );
      // highlighter.events.select.onHighlight.add((event) => {
    //   dimensions;
    // });

    highlighter.events.select.onClear.add(() => {
      // dimensions.clear();
    });
    highlighter.events.select.onHighlight.add(function (data) {
      outliner.clear(uniqueName);
      outliner.add(uniqueName, data);
    });
    highlighter.events.select.onClear.add(function () {
      outliner.clear(uniqueName);
    });
    } catch (error) {
      console.error("Erro ao carregar arquivo IFC:", error);
    }
  };


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
    <div className={`${styles.container} ${isOpen ? '' : styles.menuClosed}`}>
      <button 
          className={styles.toggleButton}
          onClick={toggleSidebar}
        >
          {isOpen ? '←' : '→'}
        </button>
      <div className={`${styles.containerOptions} ${isOpen ? '' : styles.closed}`}>
        <div className={styles.containerBtns}>
        <label htmlFor="file-upload" className={styles.customFileLabel}>
          Upload do Arquivo
        </label>
        <input id="file-upload" className={styles.fileInput} type="file" onChange={handleFileChange}></input>
        <button className={styles.button} onClick={handleUpload} disabled={!selectedFile}>
          Enviar Arquivo
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={toggleRefresh}>
          ATUALIZAR LISTA DE MODELS
        </button>
        </div>
        {files && (
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={`${styles.fileName} ${styles.filesBtn}`}>{file.original_name}</div>
                <a className={styles.button} href={file.file_url} download={file.original_name}>
                  Download
                </a>
                <button className={styles.button} onClick={() => ifcLoader(file.file_url)}>IfcLoader</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.ifcContainer} ref={containerRef}></div>
    </div>
  );
};

export default Viewer;
