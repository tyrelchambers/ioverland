import React from "react";
import { authRoutes, routes } from "./Header";
import { SignedIn } from "@clerk/nextjs";

const Footer = () => {
  return (
    <footer className=" p-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2023 iOverland. All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          {routes.map((route) => (
            <li key={route.label}>
              <a href={route.href} className="hover:underline me-4 md:me-6">
                {route.label}
              </a>
            </li>
          ))}

          <SignedIn>
            {authRoutes.map((route) => (
              <li key={route.label}>
                <a href={route.href} className="hover:underline me-4 md:me-6">
                  {route.label}
                </a>
              </li>
            ))}
          </SignedIn>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
