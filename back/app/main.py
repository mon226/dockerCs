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
    data: list
    availableGrid : list

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
              MERGE (n:Project {id: $id})
              SET n.data = $data, n.projectName = $projectName, n.savedAt = $savedAt, n.availableGrid = $availableGrid
              """,
              id=data.projectNumber,
              data=json.dumps(data.data, ensure_ascii=False),
              projectName=data.projectName,
              availableGrid=json.dumps(data.availableGrid, ensure_ascii=False),
              savedAt=saved_at
          )
      return {
          "message": "Data saved successfully",
          "id": data.projectNumber,
          "data": data.data,
          "projectName": data.projectName,
          "availableGrid": data.availableGrid,
          "savedAt": saved_at
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
        "MATCH (n:Project) RETURN n.id ORDER BY n.id DESC LIMIT 1"
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
        "MATCH (n:Project) RETURN n.id, n.data, n.projectName, n.availableGrid, n.savedAt"
      )
      data = [{"id": record["n.id"], "data": record["n.data"], "projectName": record["n.projectName"], "availableGrid": record["n.availableGrid"], "savedAt": record["n.savedAt"]} for record in result]
      return {"data": data}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
