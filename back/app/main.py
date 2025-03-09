from typing import Union
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
from fastapi.responses import FileResponse
from datetime import datetime, timezone
import json 

load_dotenv()

neo4j_auth = os.getenv("NEO4J_AUTH")
if neo4j_auth:
    user, password = neo4j_auth.split('/')

app = FastAPI()

# CORS設定
origins = [
    "http://localhost:5173",  # frontend の URL を許可
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

class SaveRequest(BaseModel):
    projectNumber: int
    projectName: str
    version: str
    colors: list
    colorList: list
    layers: list
    # planeDataは{ m:9, d:3 }の形式で受け取る
    planeData: dict
    nodes : list
    edges : list
    nodePositions : list
    edgePositions : list

@app.post("/save")
async def save(data: SaveRequest):
  """
  フロントエンドから受け取ったデータをNeo4jに保存・更新し、
  保存データをレスポンスとして返す。
  """
  try:
      saved_at = datetime.now(timezone.utc).isoformat()
      with driver.session() as session:
          ## idが存在する場合はdataとprojectNameを更新、存在しない場合は新規作成
          session.run(
              """
              MERGE (n:ProjectAll {id: $id})
              SET n.projectName = $projectName, n.savedAt = $savedAt, n.version = $version, n.colors = $colors, n.colorList = $colorList, n.layers = $layers, n.nodes = $nodes, n.edges = $edges, n.nodePositions = $nodePositions, n.edgePositions = $edgePositions, n.planeData = $planeData
              """,
              id=data.projectNumber,
              projectName=data.projectName,
              savedAt=saved_at,
              version = data.version,
              colors = json.dumps(data.colors, ensure_ascii=False),
              colorList = json.dumps(data.colorList, ensure_ascii=False),
              layers = json.dumps(data.layers, ensure_ascii=False),
              planeData = json.dumps(data.planeData, ensure_ascii=False),
              nodes = json.dumps(data.nodes, ensure_ascii=False),
              edges = json.dumps(data.edges, ensure_ascii=False),
              nodePositions = json.dumps(data.nodePositions, ensure_ascii=False),
              edgePositions = json.dumps(data.edgePositions, ensure_ascii=False)
          )
      return {
          "message": "Data saved successfully",
          "id": data.projectNumber,
          "projectName": data.projectName,
          "savedAt": saved_at,
          "version": data.version,
          "colors": data.colors,
          "colorList": data.colorList,
          "layers": data.layers,
          "planeData": data.planeData,
          "nodes": data.nodes,
          "edges": data.edges,
          "nodePositions": data.nodePositions,
          "edgePositions": data.edgePositions
      }
  except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))

# neo4jにあるデータ数を取得するエンドポイント
@app.get("/count")
async def count():
  """
  Neo4jに保存されているデータのidのうち、最大のものを取得し、1を足して返す。
  データが1つも保存されていない場合は0を返す。
  """
  try:
    with driver.session() as session:
      result = session.run(
        "MATCH (n:ProjectAll) RETURN n.id ORDER BY n.id DESC LIMIT 1"
      )
      record = result.single()
      if record:
        count = record[0] + 1
      else:
        count = 1
      return {"count": count}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# neo4jからデータを取得するエンドポイント
@app.get("/get")
async def get():
  """
  Neo4jから全てのデータを取得し、レスポンスとして返す。
  """
  try:
    with driver.session() as session:
      result = session.run(
        "MATCH (n:ProjectAll) RETURN n.id, n.projectName, n.savedAt, n.version, n.colors, n.colorList, n.layers, n.nodes, n.edges, n.nodePositions, n.edgePositions, n.planeData"
      )
      data = [{"id": record["n.id"], "projectName": record["n.projectName"], "savedAt": record["n.savedAt"], "version": record["n.version"], "colors": record["n.colors"], "colorList": record["n.colorList"], "layers": record["n.layers"], "nodes": record["n.nodes"], "edges": record["n.edges"], "nodePositions": record["n.nodePositions"], "edgePositions": record["n.edgePositions"], "planeData": record["n.planeData"]} for record in result]
      return {"data": data}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
