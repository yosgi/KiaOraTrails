"use client";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon,GlobeAltIcon } from '@heroicons/react/24/outline'
import { DynamicUserMenu } from './DynamicUserMenu'
import {DynamicSwitchLanguage} from './DynamicSwitchLanguage'
import {useTranslations} from 'next-intl';
import { ChainIndicator } from './ChainIndicator';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
  }

export default function Navbar() {
  const t = useTranslations();
  const navigation = [
    { name: t('dashboard'), href: '/', current: true },
    { name: t('airdrop'), href: '/forge', current: false },
    { name: t('staking'), href: '/stake', current: false },
    { name: t('borrow'), href: '/borrow', current: false },
    { name: t('gamefi'), href: '/gamefi', current: false }
    
  ]
  const pathname = usePathname();
  return (
    <Disclosure as="nav" className="bg-white border-b border-gray-300 shadow-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center"
              onClick={() => window.location.href = '/'}
            >
              <img
                alt="Your Company"
                src="/favicon.svg"
                className="h-8 w-auto"
              />
                                                                                        
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                   <Link
                   key={item.name}
                   href={item.href}
                   className={classNames(
                     pathname === item.href
                       ? 'bg-primary-dark text-white'
                       : 'text-primary-light hover:bg-primary hover:text-white',
                     'rounded-md px-3 py-2 text-sm font-medium',
                   )}
                 >
                   {item.name}
                 </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            
            <DynamicSwitchLanguage />
            <DynamicUserMenu />
            <div className=' ml-3'> <ChainIndicator /></div>
           
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden  w-full">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
            key={item.name}
            href={item.href}
            className={classNames(
              pathname === item.href
                ? 'bg-primary-dark text-white'
                : 'text-primary-light hover:bg-primary hover:text-white',
              'block rounded-md px-3 py-2 text-base font-medium',
            )}
          >
            {item.name}
          </Link>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
