import { useState, useEffect, useRef } from 'react';
import { File } from '../../api/api';
import styles from './Viewer.module.css';
import * as THREE from 'three';
import * as OBCF from '@thatopen/components-front';
import * as OBC from '@thatopen/components';
import * as FRAGS from '@thatopen/fragments';

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
  const worlds = new OBC.Worlds(components);
  const dimensions = new OBCF.LengthMeasurement(components)
  const volumeMeasurements = new OBCF.VolumeMeasurement(components)
  const fragmentIfcLoader = new OBC.IfcLoader(components)
  const fragments = new OBC.FragmentsManager(components)
  const grids = new OBC.Grids(components)
  const highlighter = new OBCF.Highlighter(components)
  const outliner = new OBCF.Outliner(components)

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  
  useEffect(() => {
    async function worldRenderer() {
      if (containerRef.current) {
        const newWorld = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBCF.PostproductionRenderer>();

        newWorld.scene = new OBC.SimpleScene(components);
        newWorld.renderer = new OBCF.PostproductionRenderer(components, containerRef.current);
        newWorld.camera = new OBC.SimpleCamera(components);
        
        components.init();

      
        newWorld.scene.setup();
        newWorld.scene.config.backgroundColor = new THREE.Color(0x000000);
        newWorld.scene.config.directionalLight.intensity = 10;
        newWorld.scene.config.ambientLight.intensity = 10;
        newWorld.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);

        const grid = grids.create(newWorld);
        grid.config.color = new THREE.Color(0xffffff);
        grid.config.primarySize = 10;
        grid.config.secondarySize = 40;
        grid.config.visible = true;
        newWorld.renderer.postproduction.enabled = true;
        newWorld.renderer.postproduction.customEffects.excludedMeshes.push(grid.three);
        setWorld(newWorld);
        console.log(newWorld);
      }
    }
    worldRenderer();
  }, []);

  const ifcLoader = async (file: string) => {
    try {
      if (!world) {
        console.error("Mundo (world) não está inicializado. Não é possível carregar o modelo.");
        return; 
      }

      
      outliner.world = world;
      outliner.enabled = true;
      highlighter.dispose()
      outliner.dispose()
      
      if (model && world.scene && world.scene.three) {
        world.scene.three.remove(model);
      }
      await fragmentIfcLoader.setup();
      fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
      const response = await fetch(file);
      const data = await response.arrayBuffer();
      const buffer = new Uint8Array(data);
      
      const newModel = await fragmentIfcLoader.load(buffer);
  
      setModel(newModel);
      world.scene.three.add(newModel);
      
      
     
      dimensions.world = world;
      dimensions.enabled = true;
      dimensions.snapDistance = 1;
      
      volumeMeasurements.world = world;
      volumeMeasurements.enabled = true;
  

      highlighter.setup({selectionColor: new THREE.Color(0x00bfff), world, hoverColor: new THREE.Color(0x00008b)});
      highlighter.zoomToSelection = true;
  
      const uniqueName = `model_${Date.now()}`;
      outliner.create(
        uniqueName,
        new THREE.MeshBasicMaterial({
          color: 0x00008b,
          transparent: true,
          opacity: 0.5,
        }),
      );

      highlighter.events.select.onHighlight.add((data) => {
        outliner.clear(uniqueName);
        outliner.add(uniqueName, data);
      });
      
      highlighter.events.select.onClear.add(() => {
        outliner.clear(uniqueName);
      });
    
    } catch (error) {
      console.error("Erro ao carregar arquivo IFC:", error);
    }
    
  };

  

  

  const exportModelAsFragment = () => {
    try {
      // Verifique se o modelo existe
      if (!model) {
        alert('Carregue um modelo antes de exportar');
        return;
      }
      
      // Crie um serializador
      const serializer = new FRAGS.Serializer();
      
      // Exporte o modelo (que é um FragmentsGroup) para bytes
      const fragmentBytes = serializer.export(model);
      
      // Crie um blob a partir dos bytes
      const blob = new Blob([fragmentBytes], { type: 'application/octet-stream' });
      
      // Crie uma URL para o blob
      const url = URL.createObjectURL(blob);
      
      // Crie um elemento de link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name || 'modelo'}_fragmentado.frag`; // Use .frag como extensão para fragmentos
      
      // Adicione o link ao documento, clique nele e remova-o
      document.body.appendChild(a);
      a.click();
      
      // Limpe a URL do objeto após o download
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Erro ao exportar modelo como fragmento:', error);
      alert('Erro ao exportar o modelo');
    }
  };
//If you want to get the resulted model every time a new model is loaded, you can subscribe to the following event anywhere in your app:
  fragments.onFragmentsLoaded.add((model) => {
    console.log(model);
  });


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
          <label htmlFor="file-upload" className={styles.button}>
            Upload do Arquivo
          </label>
          <input id="file-upload" className={styles.fileInput} type="file" onChange={handleFileChange}></input>
          <button className={styles.button} onClick={handleUpload} disabled={!selectedFile}>
            Enviar Arquivo
          </button>
          {uploadStatus && <p>{uploadStatus}</p>}
          <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={toggleRefresh}>
            Atualizar
          </button>
        </div>
        {files && (
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileName}>{file.original_name}</div>
                <div className={styles.fileActions}>
                <button className={styles.button} onClick={() => ifcLoader(file.file_url)}>Carregar IFC</button>
                <button className={styles.button} onClick={exportModelAsFragment}>
                  Exportar como Fragmento
                </button>
                <a className={styles.button} href={file.file_url} download={file.original_name}>
                  Download
                </a>
                </div>
                
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
