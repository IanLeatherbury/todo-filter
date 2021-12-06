import { CraftBlock } from "@craftdocs/craft-extension-api";
import { CheckCircleIcon } from '@heroicons/react/solid'
import * as ReactDOM from 'react-dom'
import { useState } from "react";
import * as React from "react"
import 'tailwindcss/tailwind.css'
import './style.css'

const App: React.FC<{}> = () => {
  const isDarkMode = useCraftDarkMode();
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  var loadedBlocks: CraftBlock[] = []

  async function cutAndFilterTheCurrentPage() {
    // Query the page which is currently opened
    const result = await craft.dataApi.getCurrentPage()

    // Check if the query succeeded
    if (result.status !== "success") {
      throw new Error(result.message)
    }

    const pageBlock = result.data

    var blocksToKeep: CraftBlock[] = []
    var uncheckedBlockIds: string[] = []
    var uncheckedOnly: CraftBlock[] = []
    var uncheckedOnlyIds: string[] = []

    pageBlock.subblocks.filter(async block => {
      if (incompleteOnly === true) {
        if (block.listStyle.type === "todo" && block.listStyle.state === "unchecked") {
          // Copy the unchecked blocks but delete them from the current page
          uncheckedOnly.push(block)
          uncheckedOnlyIds.push(block.id)
        } else {
          return
        }
        loadedBlocks = uncheckedOnly
        await craft.dataApi.deleteBlocks(uncheckedOnlyIds)
      } else {
        if (block.listStyle.type === "todo" && block.listStyle.state === "unchecked") {
          // Copy the unchecked blocks but delete them from the current page
          uncheckedBlockIds.push(block.id)
          blocksToKeep.push(block)
        } else if (block.listStyle.type === "todo" && block.listStyle.state === "checked") {
          // Leave checked blocks on the current page
          return
        }
        else {
          // Copy the rest of the blocks
          blocksToKeep.push(block)
        }        
        await craft.dataApi.deleteBlocks(uncheckedBlockIds)
        loadedBlocks = blocksToKeep
      }
    })
  }


  async function paste() {
    const blocks = loadedBlocks
    const result = await craft.dataApi.addBlocks(blocks)

    // Check if the update succeeded
    if (result.status !== "success") {
      throw new Error(result.message)
    }
  }

  function useCraftDarkMode() {
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    React.useEffect(() => {
      craft.env.setListener(env => setIsDarkMode(env.colorScheme === "dark"));
    }, []);

    return isDarkMode;
  }


  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col">
        <div className="flex justify-center my-2">
          <CheckCircleIcon className="w-10 h-10 text-blue-500" />
        </div>
        <button className={`btn ${isDarkMode ? "dark" : "px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={cutAndFilterTheCurrentPage}>
          Cut and filter
        </button>
        <button className={`btn ${isDarkMode ? "dark" : "mt-2 px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`} onClick={paste}>
          Paste
        </button>
        {/* Incomplete Settings */}
        <div className="relative flex items-start my-4">
          <div className="flex items-center h-5">
            <input
              id="incomplete"
              name="incomplete"
              type="checkbox"
              checked={incompleteOnly}
              onChange={() => { setIncompleteOnly(!incompleteOnly) }}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="incomplete" className="font-medium text-gray-700">
              Incomplete Only
            </label>
            <p id="incomplete-description" className="text-gray-500">
              Only cut incomplete todos.
            </p>
          </div>
        </div>
      </div>
    </div>);
}

export function initApp() {
  ReactDOM.render(<App />, document.getElementById('react-root'))
}
