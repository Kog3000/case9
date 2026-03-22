import './InputCase.css'

export default function InputCase({title, content}) {
    return(
        <div>
            <p>{title}</p>
            <input placeholder={content}></input>
        </div>
    )
}
