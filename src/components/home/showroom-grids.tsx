import { ModelGrid } from "./model-grid";
import { getShowroomModels } from "@/lib/data/showroom-models";
import { AccessoryTile } from "./accessory-tile";
import { Stagger } from "@/components/ui/reveal";
import { SHOWROOM_ACCESSORIES } from "@/data/showroom";

export async function ShowroomModelGrid() {
  return <ModelGrid models={await getShowroomModels()} />;
}

export function ShowroomAccessoryGrid() {
  return (
    <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
      {SHOWROOM_ACCESSORIES.map((a) => <AccessoryTile key={a.name} name={a.name} image={a.image} />)}
    </Stagger>
  );
}
