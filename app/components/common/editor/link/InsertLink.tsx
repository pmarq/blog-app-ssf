import { FC, useState } from "react";
import Button from "../Button";
import { BsLink45Deg } from "react-icons/bs"
import LinkForm, { linkOpition } from "./LinkForm";
 
interface Props {
    onSubmit(link:linkOpition): void;
 }

const InserLink: FC<Props> = ({ onSubmit }): JSX.Element => {
    const [visible, setVisible] = useState(false)

    const handleSubmit = (link: linkOpition) => {
        if (!link.url.trim()) return setVisible(false)
        onSubmit(link)
        setVisible(false)
    }

    return ( 
    <div 
    onKeyDown={({ key })=> {
        if (key === "Escape") setVisible(false);
    }} 
      className="relative">  

        <Button onClick={() => setVisible(!visible)}>
            <BsLink45Deg/>
        </Button>

     <div className="absolute top-full mt-4 right-0 z-50">
        <LinkForm visible={visible} onSubmit={handleSubmit}/>
     </div>
    </div> 
    ) 
};

export default InserLink;

