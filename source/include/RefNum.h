#ifndef RefNum_H
#define RefNum_H

/**

 Copyright (c) 2017 National Instruments Corp.

 This software is subject to the terms described in the LICENSE.TXT file

 Craig S
*/

/*! \file
 \brief Classes for RefNum API
 */

#include "TypeAndDataManager.h"
#include "Thread.h"

#include <vector>
#include <map>

namespace Vireo {

typedef UInt32 RefNum;
typedef intptr_t RefNumDataBase;
//typedef RefNumDataBase* RefNumData;
typedef void* RefNumData;

struct RefNumCommonHeader {
    volatile UInt32	magicNum;	// Non-zero unique id to compare with hi word of cookie.
    volatile Int32 nextFree;
};

typedef std::vector<RefNum> RefNumList;

static const RefNum kNotARefNum = RefNum(0);

typedef intptr_t *RefNumDataPtr;

//template <typename T, bool _isRefCounted>
class RefNumStorageBase
{
protected:
    UInt32	_nextMagicNum;	// Magic Number to be used for creating next requested cookie
    UInt32	_dataSize;		// Size of user-provided cookie info
    UInt32	_cookieSize;	// Size of entire cookie including info
    Int32	_firstFree;		// Index of first free cookie record
    Int32   _numUsed;		// Total number of used cookies
#ifdef  VIREO_MULTI_THREAD
    Mutex _mutex;			// Must have Acquired this mutex before read/writing to fields
#endif
    bool _isRefCounted;
    struct RefNumHeaderAndData {
        RefNumCommonHeader _refHeader;
        intptr_t _refData;
    };
    NIError		Init(Int32 size, Int32 totalSize, bool isRefCounted);
    NIError		Uninit();

    RefNum      NewRefNum(RefNumDataPtr info);
    NIError		DisposeRefNum(const RefNum &refnum, RefNumDataPtr info);
    NIError		SetRefNumData(const RefNum &refnum, RefNumDataPtr info);
    NIError		GetRefNumData(const RefNum &refnum, RefNumDataPtr info);

    bool		AcquireRefNumRights(const RefNum &refnum, RefNumDataPtr info);
    RefNumHeaderAndData* ValidateRefNumIndex(RefNum cookie);
    RefNumHeaderAndData* CreateRefNumIndex(RefNum cookie);
    virtual RefNumHeaderAndData* ValidateRefNumIndexT(RefNum cookie) = 0;
    virtual RefNumHeaderAndData* CreateRefNumIndexT(RefNum cookie, bool &isNew) = 0;

    virtual void Clear() = 0;

    virtual ~RefNumStorageBase() { }

public:
    Int32		ReleaseRefNumRights(const RefNum &refnum);
    bool		IsARefNum(const RefNum &refnum);
    Int32		GetRefNumCount();
    NIError		GetRefNumList(RefNumList &list);
};

template <typename T, bool _isRefCounted>
class TypedRefNum : public RefNumStorageBase {
protected:
    typedef T* RefNumActualDataPtr;
    struct RefNumHeaderAndTypedData {
        RefNumCommonHeader _refHeader;
        T _refData;
    };
    typedef std::map<RefNum, RefNumHeaderAndTypedData> RefNumMap;

    RefNumMap _refStorage;

    virtual RefNumHeaderAndData* ValidateRefNumIndexT(UInt32 index);
    virtual RefNumHeaderAndData* CreateRefNumIndexT(UInt32 index, bool &isNew);
    virtual void Clear() { _refStorage.clear(); }

public:
    RefNum      NewRefNum(RefNumActualDataPtr info) { return RefNumStorageBase::NewRefNum(reinterpret_cast<RefNumDataPtr>(info)); }
    NIError		DisposeRefNum(const RefNum &refnum, RefNumActualDataPtr info)  { return RefNumStorageBase::DisposeRefNum(refnum, reinterpret_cast<RefNumDataPtr>(info)); }
    NIError		SetRefNumData(const RefNum &refnum, RefNumActualDataPtr info)  { return RefNumStorageBase::SetRefNumData(refnum, reinterpret_cast<RefNumDataPtr>(info)); }
    NIError		GetRefNumData(const RefNum &refnum, RefNumActualDataPtr info)  { return RefNumStorageBase::GetRefNumData(refnum, reinterpret_cast<RefNumDataPtr>(info)); }

    bool		AcquireRefNumRights(const RefNum &refnum, RefNumActualDataPtr info)  { return RefNumStorageBase::AcquireRefNumRights(refnum, reinterpret_cast<RefNumDataPtr>(info)); }

    TypedRefNum() { Init(Int32(sizeof(T)), Int32(sizeof(RefNumHeaderAndTypedData)), true); }
    virtual ~TypedRefNum() { Uninit(); }
};


/**
 Retrieve the refnum data at index in RefNumStorage.
 */
template <typename T, bool _isRefCounted>
typename RefNumStorageBase::RefNumHeaderAndData* TypedRefNum<T,_isRefCounted>::ValidateRefNumIndexT(UInt32 index)
{
    typename RefNumMap::iterator it = _refStorage.find(index);
    if (it != _refStorage.end())
        return reinterpret_cast<RefNumHeaderAndData*>(&it->second);
    return NULL;
}

/**
  Create new refnum data at index in RefNumStorage
 */
template <typename T, bool _isRefCounted>
typename RefNumStorageBase::RefNumHeaderAndData* TypedRefNum<T,_isRefCounted>::CreateRefNumIndexT(UInt32 index, bool &isNew)
{
    typename RefNumMap::iterator it = _refStorage.find(index);
    if (it == _refStorage.end()) {
        isNew = true;
        return reinterpret_cast<RefNumHeaderAndData*>(&_refStorage[index]);
    } else {
        isNew = false;
        return reinterpret_cast<RefNumHeaderAndData*>(&it->second);
    }
}

} // namespace

#endif /* RefNum_H */