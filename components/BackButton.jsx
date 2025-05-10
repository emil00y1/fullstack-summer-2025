import Link from "next/link"
import { Button } from "./ui/button"

function BackButton({href}) {
  return (
      <Link href={href} className="mr-6 ">
          <Button variant="ghost" className="cursor-pointer">
            ←
          </Button>
        </Link>
  )
}

export default BackButton