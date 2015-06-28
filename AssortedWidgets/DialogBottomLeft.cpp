#include "DialogBottomLeft.h"
#include "Dialog.h"

namespace AssortedWidgets
{
	namespace Widgets
	{
		DialogBottomLeft::DialogBottomLeft(int x,int y,unsigned int width,unsigned int height)
		{
            m_position.x=x;
            m_position.y=y;
            m_size.m_width=width;
            m_size.m_height=height;
		}

		DialogBottomLeft::~DialogBottomLeft(void)
		{
		}
		
        void DialogBottomLeft::dragReleased(const Event::MouseEvent &)
		{}

		void DialogBottomLeft::dragMoved(int offsetX,int offsetY)
		{
            Util::Size minimize=m_parent->getPreferedSize();
			
            if((m_parent->m_size.m_width-offsetX)>minimize.m_width)
			{
                m_parent->m_position.x+=offsetX;
                m_parent->m_size.m_width-=offsetX;
			}
			
            if((m_parent->m_size.m_height+offsetY)>minimize.m_height)
			{
                m_parent->m_size.m_height+=offsetY;
			}
			
            m_parent->pack();
		}
	}
}
