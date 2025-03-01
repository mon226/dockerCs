// .envからPASSを取得
// このtsファイルはdockerCs/vite_fast/src/stores/にある
// .envファイルはシステム全体のものであり、dockerCs/にある

const version = import.meta.env.VITE_VERSION as string;
// versionごとにデータの形を定義
// ver1.1.0では      id, data, projectName, availableGrid, savedAt, version
// ver1.2.0では      id, data, projectName, availableGrid, savedAt, version, newProperty
// というようにデータの形が変わることがある
// そのため、versionごとにデータの形を定義しておく

interface DataV1_1_0 {
  projectNumber: number;
  data: Record<string, any>;
  projectName: string;
  availableGrid: Record<string, any>;
  version: string;
}

interface DataV1_2_0 extends DataV1_1_0 {
  newProperty: string;
}

export const reviseData = (data : any) => {
  if (data.version === '1.1.0') {
    console.log(data.version, data.projectNumber, data.data, data.projectName, data.availableGrid);
  } else if (data.version === '1.2.0') {
    console.log(version);
  }
}