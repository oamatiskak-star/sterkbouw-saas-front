-- Ontbrekende schakel: IFC-entity → NL-SfB-element (gestandaardiseerde correspondenties).
-- Sluit de keten IFC-object → IFC-class → NL-SfB → combi (via bestaande combi↔NL-SfB links).
-- Toegepast op pmovaz-prod 2026-06-16 (mirror van apply_migration 20260616_17).
insert into harvest.map_classificatie (ifc_entity, nlsfb_code, confidence, bron, status) values
('IfcFooting','16',0.9,'ifc-nlsfb-seed','active'),('IfcPile','17',0.9,'ifc-nlsfb-seed','active'),
('IfcSlab','23',0.85,'ifc-nlsfb-seed','active'),('IfcWall','21',0.8,'ifc-nlsfb-seed','active'),
('IfcWallStandardCase','21',0.8,'ifc-nlsfb-seed','active'),('IfcColumn','28',0.9,'ifc-nlsfb-seed','active'),
('IfcBeam','28',0.9,'ifc-nlsfb-seed','active'),('IfcMember','28',0.7,'ifc-nlsfb-seed','active'),
('IfcRoof','27',0.9,'ifc-nlsfb-seed','active'),('IfcWindow','31',0.9,'ifc-nlsfb-seed','active'),
('IfcDoor','32',0.85,'ifc-nlsfb-seed','active'),('IfcStair','24',0.9,'ifc-nlsfb-seed','active'),
('IfcStairFlight','24',0.85,'ifc-nlsfb-seed','active'),('IfcRailing','34',0.85,'ifc-nlsfb-seed','active'),
('IfcCovering','42',0.7,'ifc-nlsfb-seed','active'),('IfcCurtainWall','21',0.8,'ifc-nlsfb-seed','active')
on conflict do nothing;
